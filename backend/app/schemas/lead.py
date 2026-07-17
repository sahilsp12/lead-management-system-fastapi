from datetime import datetime

from typing import Optional

from pydantic import BaseModel, EmailStr, Field

class LeadBase(BaseModel):

    name: str = Field(..., min_length=2, max_length=100)

    email: EmailStr

    phone: Optional[str] = Field(None, max_length=20)

    source: Optional[str] = Field(None, max_length=50)

    status: Optional[str] = Field("NEW", max_length=30)

    notes: Optional[str] = None

class LeadCreate(LeadBase):

    pass

class LeadUpdate(BaseModel):

    name: Optional[str] = Field(None, min_length=2, max_length=100)

    email: Optional[EmailStr] = None

    phone: Optional[str] = Field(None, max_length=20)

    source: Optional[str] = Field(None, max_length=50)

    status: Optional[str] = Field(None, max_length=30)

    notes: Optional[str] = None

    assigned_to: Optional[int] = None

class ActivityLogOut(BaseModel):

    id: int

    lead_id: int

    user_id: Optional[int] = None

    action: str

    description: str

    created_at: datetime

    class Config:

        from_attributes = True

class LeadOut(LeadBase):

    id: int

    assigned_to: Optional[int] = None

    created_by: Optional[int] = None

    created_at: datetime

    updated_at: datetime

    activities: list[ActivityLogOut] = []

    class Config:

        from_attributes = True

class LeadPagination(BaseModel):

    total: int

    page: int

    limit: int

    pages: int

    leads: list[LeadOut]

