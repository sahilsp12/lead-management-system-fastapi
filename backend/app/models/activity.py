from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True)

    lead_id = Column(Integer, ForeignKey("leads.id"))

    user_id = Column(Integer, ForeignKey("users.id"))

    action = Column(String(100))

    description = Column(String(255))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lead = relationship("Lead", back_populates="activities")