from sqlalchemy.orm import Session

from app.models.activity import ActivityLog

def log_activity(db: Session, lead_id: int, user_id: int, action: str, description: str) -> ActivityLog:

    """Log an event relating to a lead (created, updated, assigned, etc.)."""

    log_entry = ActivityLog(

        lead_id=lead_id,

        user_id=user_id,

        action=action,

        description=description

    )

    db.add(log_entry)

    db.commit()

    db.refresh(log_entry)

    return log_entry

