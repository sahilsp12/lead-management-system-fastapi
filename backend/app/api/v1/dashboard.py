from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.lead import Lead

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve lead statistics for the dashboard.
    Managers/Admins see all leads, while Agents only see stats for their assigned leads.
    """
    # 1. Scope query based on role
    query = db.query(Lead)
    if current_user.role == "Agent":
        query = query.filter(Lead.assigned_to == current_user.id)
        
    total_leads = query.count()
    
    # 2. Group by status
    status_counts = (
        query.with_entities(Lead.status, func.count(Lead.id))
        .group_by(Lead.status)
        .all()
    )
    status_stats = {status: count for status, count in status_counts}
    
    # 3. Group by source
    source_counts = (
        query.with_entities(Lead.source, func.count(Lead.id))
        .group_by(Lead.source)
        .all()
    )
    source_stats = {source or "Unknown": count for source, count in source_counts}
    
    # 4. Fetch 5 most recent leads
    recent_leads = query.order_by(Lead.created_at.desc()).limit(5).all()
    recent_leads_data = [
        {
            "id": lead.id,
            "name": lead.name,
            "email": lead.email,
            "status": lead.status,
            "created_at": lead.created_at
        }
        for lead in recent_leads
    ]
    
    return {
        "total_leads": total_leads,
        "status_stats": status_stats,
        "source_stats": source_stats,
        "recent_leads": recent_leads_data
    }
