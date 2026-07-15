from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True)

    name = Column(String(100), nullable=False)

    email = Column(String(150), nullable=False)

    phone = Column(String(20))

    source = Column(String(50))

    status = Column(String(30), default="NEW")

    notes = Column(Text)

    assigned_to = Column(Integer, ForeignKey("users.id"))

    created_by = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    creator = relationship(
        "User",
        foreign_keys=[created_by],
        back_populates="created_leads"
    )

    agent = relationship(
        "User",
        foreign_keys=[assigned_to],
        back_populates="assigned_leads"
    )

    activities = relationship(
        "ActivityLog",
        back_populates="lead",
        cascade="all, delete"
    )