from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, RoleChecker
from app.models.user import User
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadOut, LeadUpdate, LeadPagination
from app.services.assignment import get_next_agent_for_assignment
from app.services.activity import log_activity
from app.services.external_api import fetch_random_user_data

router = APIRouter(prefix="/leads", tags=["Leads"])

# Dependencies for role validation
manager_or_admin = RoleChecker(["Manager", "Admin"])


@router.get("/", response_model=LeadPagination)
def list_leads(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    status_filter: Optional[str] = None,
    source_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a paginated list of leads, applying search, sorting, filters, and role-based access checks."""
    query = db.query(Lead)

    # 1. Role Authorization Checks: Agents can only view leads assigned to them
    if current_user.role == "Agent":
        query = query.filter(Lead.assigned_to == current_user.id)

    # 2. Filters
    if status_filter:
        query = query.filter(Lead.status == status_filter)
    if source_filter:
        query = query.filter(Lead.source == source_filter)

    # 3. Search (by name, email, or phone)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Lead.name.like(search_pattern)) |
            (Lead.email.like(search_pattern)) |
            (Lead.phone.like(search_pattern))
        )

    # 4. Sorting
    sort_col = Lead.created_at
    if sort_by == "name":
        sort_col = Lead.name
        
    if sort_dir == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    # 5. Pagination
    total = query.count()
    offset = (page - 1) * limit
    leads = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit or 1,
        "leads": leads
    }


@router.post("/", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_or_admin)
):
    """Create a new lead (Manager and Admin only) and run round-robin assignment."""
    # Determine the next agent to assign using round robin
    assigned_agent_id = get_next_agent_for_assignment(db)
    
    new_lead = Lead(
        name=lead_in.name,
        email=lead_in.email,
        phone=lead_in.phone,
        source=lead_in.source,
        status=lead_in.status or "NEW",
        notes=lead_in.notes,
        created_by=current_user.id,
        assigned_to=assigned_agent_id
    )
    
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    
    # Log Lead Created Activity
    agent_name = "Unassigned"
    if assigned_agent_id:
        agent = db.query(User).filter(User.id == assigned_agent_id).first()
        if agent:
            agent_name = agent.name
            
    log_activity(
        db,
        lead_id=new_lead.id,
        user_id=current_user.id,
        action="Lead Created",
        description=f"Lead created by {current_user.name} and auto-assigned to {agent_name}."
    )
    
    return new_lead


@router.get("/import-random")
def import_random_lead(
    current_user: User = Depends(manager_or_admin)
):
    """Fetch a random user profile from Random User API without creating a database record."""
    random_user = fetch_random_user_data()
    if not random_user:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch user data from external API"
        )
    
    return {
        "name": random_user["name"],
        "email": random_user["email"],
        "phone": random_user["phone"],
        "source": "External API",
        "notes": f"Auto-imported from Random User API. Location: {random_user['location']}."
    }


@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch details of a single lead by ID with role-based access checks."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    # If the user is an Agent, restrict to leads assigned to them
    if current_user.role == "Agent" and lead.assigned_to != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this lead"
        )
        
    return lead


@router.put("/{lead_id}", response_model=LeadOut)
def update_lead(
    lead_id: int,
    lead_in: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update lead details with field restrictions and record activities."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
        
    old_status = lead.status
    old_assigned_to = lead.assigned_to
    
    has_changes = False
    status_changed = False
    assignment_changed = False
    
    # If Agent, verify they are assigned and limit what fields they can update
    if current_user.role == "Agent":
        if lead.assigned_to != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this lead"
            )
        # Agents can only update status and notes
        if lead_in.status is not None and lead_in.status != lead.status:
            lead.status = lead_in.status
            status_changed = True
            has_changes = True
        if lead_in.notes is not None and lead_in.notes != lead.notes:
            lead.notes = lead_in.notes
            has_changes = True
    else:
        # Managers and Admins can update all fields
        if lead_in.name is not None and lead_in.name != lead.name:
            lead.name = lead_in.name
            has_changes = True
        if lead_in.email is not None and lead_in.email != lead.email:
            lead.email = lead_in.email
            has_changes = True
        if lead_in.phone is not None and lead_in.phone != lead.phone:
            lead.phone = lead_in.phone
            has_changes = True
        if lead_in.source is not None and lead_in.source != lead.source:
            lead.source = lead_in.source
            has_changes = True
        if lead_in.status is not None and lead_in.status != lead.status:
            lead.status = lead_in.status
            status_changed = True
            has_changes = True
        if lead_in.notes is not None and lead_in.notes != lead.notes:
            lead.notes = lead_in.notes
            has_changes = True
        if lead_in.assigned_to is not None and lead_in.assigned_to != lead.assigned_to:
            lead.assigned_to = lead_in.assigned_to
            assignment_changed = True
            has_changes = True

    if has_changes:
        db.commit()
        db.refresh(lead)
        
        # Log status changed
        if status_changed:
            log_activity(
                db,
                lead_id=lead.id,
                user_id=current_user.id,
                action="Status Changed",
                description=f"Status changed from {old_status} to {lead.status} by {current_user.name}."
            )
        
        # Log lead assigned/reassigned
        if assignment_changed:
            agent_name = "Unassigned"
            if lead.assigned_to:
                agent = db.query(User).filter(User.id == lead.assigned_to).first()
                if agent:
                    agent_name = agent.name
            log_activity(
                db,
                lead_id=lead.id,
                user_id=current_user.id,
                action="Lead Assigned",
                description=f"Lead assigned to {agent_name} by {current_user.name}."
            )
            
        # Log generic update if it wasn't just a status or assignment change
        if not status_changed and not assignment_changed:
            log_activity(
                db,
                lead_id=lead.id,
                user_id=current_user.id,
                action="Lead Updated",
                description=f"Lead details updated by {current_user.name}."
            )

    return lead


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_or_admin)
):
    """Delete a lead (Manager and Admin only)."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    db.delete(lead)
    db.commit()
    return

