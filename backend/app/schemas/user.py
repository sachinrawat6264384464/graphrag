"""User Pydantic Schemas."""

import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from backend.app.schemas.workspace import WorkspaceResponse


class UserBase(BaseModel):
    """Base user properties."""

    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for registering a new user."""

    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class UserLogin(BaseModel):
    """Schema for user credentials authentication."""

    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Public user profile schema."""

    id: uuid.UUID
    is_active: bool
    is_platform_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileResponse(BaseModel):
    """User profile along with accessible workspaces."""

    user: UserResponse
    workspaces: List[WorkspaceResponse]

