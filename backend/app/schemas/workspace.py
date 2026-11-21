"""Workspace and Multi-Tenant Schemas."""

import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from backend.app.models.workspace import WorkspaceRole


class WorkspaceBase(BaseModel):
    """Common workspace attributes."""

    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None


class WorkspaceCreate(WorkspaceBase):
    """Workspace creation payload."""

    slug: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
        pattern=r"^[a-z0-9-]+$",
        description="Optional custom slug. Auto-generated from name if omitted.",
    )


class WorkspaceResponse(WorkspaceBase):
    """Workspace details returned to client."""

    id: uuid.UUID
    slug: str
    is_active: bool
    created_at: datetime
    current_user_role: Optional[WorkspaceRole] = None

    model_config = {"from_attributes": True}


class WorkspaceMemberAdd(BaseModel):
    """Invite or add user to a workspace."""

    email: EmailStr
    role: WorkspaceRole = WorkspaceRole.EDITOR


class WorkspaceMemberResponse(BaseModel):
    """Membership record with user details."""

    id: uuid.UUID
    user_id: uuid.UUID
    workspace_id: uuid.UUID
    email: str
    full_name: Optional[str] = None
    role: WorkspaceRole
    created_at: datetime

    model_config = {"from_attributes": True}

