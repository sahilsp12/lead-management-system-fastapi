from datetime import datetime

from typing import Optional

from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):

    name: str = Field(..., min_length=2, max_length=100)

    email: EmailStr

    role: str = Field(..., pattern="^(Admin|Manager|Agent)$")

class UserCreate(UserBase):

    password: str = Field(..., min_length=6, max_length=100)

class UserUpdate(BaseModel):

    name: Optional[str] = Field(None, min_length=2, max_length=100)

    email: Optional[EmailStr] = None

    role: Optional[str] = Field(None, pattern="^(Admin|Manager|Agent)$")

    password: Optional[str] = Field(None, min_length=6, max_length=100)

class UserOut(UserBase):

    id: int

    created_at: datetime

    class Config:

        from_attributes = True

class UserLogin(BaseModel):

    email: EmailStr

    password: str

