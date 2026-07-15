from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, RoleChecker
from app.models.user import User
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadOut, LeadUpdate

router = APIRouter(prefix="/leads", tags=["Leads"])

# Dependencies for role validation
manager_or_admin = RoleChecker(["Manager", "Admin"])


@router.post("/", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_or_admin)
):
    """Create a new lead (Manager and Admin only)."""
    new_lead = Lead(
        name=lead_in.name,
        email=lead_in.email,
        phone=lead_in.phone,
        source=lead_in.source,
        status=lead_in.status or "NEW",
        notes=lead_in.notes,
        created_by=current_user.id,
        assigned_to=None  # Round robin auto-assignment will be implemented in Module 12
    )
    
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    return new_lead


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
    """Update lead details with field restrictions based on role."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
        
    # If Agent, verify they are assigned and limit what fields they can update
    if current_user.role == "Agent":
        if lead.assigned_to != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this lead"
            )
        # Agents can only update status and notes
        if lead_in.status is not None:
            lead.status = lead_in.status
        if lead_in.notes is not None:
            lead.notes = lead_in.notes
    else:
        # Managers and Admins can update all fields
        if lead_in.name is not None:
            lead.name = lead_in.name
        if lead_in.email is not None:
            lead.email = lead_in.email
        if lead_in.phone is not None:
            lead.phone = lead_in.phone
        if lead_in.source is not None:
            lead.source = lead_in.source
        if lead_in.status is not None:
            lead.status = lead_in.status
        if lead_in.notes is not None:
            lead.notes = lead_in.notes
        if lead_in.assigned_to is not None:
            lead.assigned_to = lead_in.assigned_to

    db.commit()
    db.refresh(lead)
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
