"""Workspace Multi-Tenant Management Endpoints."""

import re
import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.api.deps import (
    WorkspaceContext,
    get_current_user,
    require_workspace_roles,
    verify_workspace_access,
)
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole
from backend.app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceMemberAdd,
    WorkspaceMemberResponse,
    WorkspaceResponse,
)

router = APIRouter()


def slugify(text: str) -> str:
    """Generate clean URL-friendly slug."""
    text = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "-", text)


@router.post(
    "",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Multi-Tenant Workspace",
)
async def create_workspace(
    payload: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new workspace boundary. Creator becomes workspace administrator."""
    base_slug = payload.slug or slugify(payload.name)

    if payload.slug:
        # User specified an explicit slug -> must be unique as requested
        existing = await db.execute(select(Workspace).where(Workspace.slug == payload.slug))
        if existing.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A workspace with slug '{payload.slug}' already exists",
            )
        slug = payload.slug
    else:
        # Auto-generated from name -> auto-disambiguate if slug exists
        slug = base_slug
        counter = 1
        while True:
            existing = await db.execute(select(Workspace).where(Workspace.slug == slug))
            if not existing.scalars().first():
                break
            slug = f"{base_slug}-{counter}"
            counter += 1

    workspace = Workspace(
        name=payload.name,
        slug=slug,
        description=payload.description,
        is_active=True,
    )
    db.add(workspace)
    await db.flush()

    # Assign creator as workspace administrator
    membership = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=current_user.id,
        role=WorkspaceRole.WORKSPACE_ADMIN,
    )
    db.add(membership)
    await db.commit()
    await db.refresh(workspace)

    resp = WorkspaceResponse.model_validate(workspace)
    resp.current_user_role = WorkspaceRole.WORKSPACE_ADMIN
    return resp


@router.get(
    "",
    response_model=List[WorkspaceResponse],
    summary="List Workspaces for Current User",
)
async def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List all workspace tenants the current user is a member of."""
    result = await db.execute(
        select(Workspace, WorkspaceMember.role)
        .join(WorkspaceMember, Workspace.id == WorkspaceMember.workspace_id)
        .where(
            WorkspaceMember.user_id == current_user.id,
            Workspace.is_active.is_(True),
        )
    )

    workspaces = []
    for ws, role in result.all():
        ws_data = WorkspaceResponse.model_validate(ws)
        ws_data.current_user_role = role
        workspaces.append(ws_data)

    return workspaces


@router.get(
    "/{workspace_id}",
    response_model=WorkspaceResponse,
    summary="Get Specific Workspace Details (Tenant Isolated)",
)
async def get_workspace(
    workspace_id: uuid.UUID,
    context: WorkspaceContext = Depends(verify_workspace_access),
) -> Any:
    """Retrieve details for a specific workspace if user is authorized."""
    resp = WorkspaceResponse.model_validate(context.workspace)
    resp.current_user_role = context.role
    return resp


@router.post(
    "/{workspace_id}/members",
    response_model=WorkspaceMemberResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Member to Workspace (Admin Only)",
)
async def add_workspace_member(
    workspace_id: uuid.UUID,
    payload: WorkspaceMemberAdd,
    context: WorkspaceContext = Depends(
        require_workspace_roles([WorkspaceRole.WORKSPACE_ADMIN])
    ),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Add a registered user to the workspace with specified role."""
    # Lookup target user by email
    user_res = await db.execute(
        select(User).where(User.email == payload.email.lower())
    )
    target_user = user_res.scalars().first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user registered with this email address",
        )

    # Check if already a member
    mem_res = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == target_user.id,
        )
    )
    if mem_res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this workspace",
        )

    membership = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=target_user.id,
        role=payload.role,
    )
    db.add(membership)
    await db.commit()
    await db.refresh(membership)

    return WorkspaceMemberResponse(
        id=membership.id,
        user_id=target_user.id,
        workspace_id=workspace_id,
        email=target_user.email,
        full_name=target_user.full_name,
        role=membership.role,
        created_at=membership.created_at,
    )


@router.get(
    "/{workspace_id}/members",
    response_model=List[WorkspaceMemberResponse],
    summary="List Members of Workspace (Tenant Isolated)",
)
async def list_workspace_members(
    workspace_id: uuid.UUID,
    context: WorkspaceContext = Depends(verify_workspace_access),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List all authorized members in the specified workspace."""
    result = await db.execute(
        select(WorkspaceMember, User)
        .join(User, WorkspaceMember.user_id == User.id)
        .where(WorkspaceMember.workspace_id == workspace_id)
    )

    members = []
    for mem, user in result.all():
        members.append(
            WorkspaceMemberResponse(
                id=mem.id,
                user_id=user.id,
                workspace_id=workspace_id,
                email=user.email,
                full_name=user.full_name,
                role=mem.role,
                created_at=mem.created_at,
            )
        )
    return members

