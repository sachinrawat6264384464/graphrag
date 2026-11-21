"""Authentication and Multi-Tenant Dependency Injections."""

import uuid
from dataclasses import dataclass
from typing import Annotated, List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.config import settings
from backend.app.core.security import decode_access_token
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


@dataclass
class WorkspaceContext:
    """Encapsulates verified multi-tenant boundary for the current request."""

    workspace: Workspace
    role: WorkspaceRole
    user: User


async def get_current_user(
    token: Annotated[Optional[str], Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db),
) -> User:
    """Validate Bearer JWT and retrieve active authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id_str: Optional[str] = payload.get("sub")
    if not user_id_str:
        raise credentials_exception

    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalars().first()

    if user is None or not user.is_active:
        raise credentials_exception

    return user


async def get_current_active_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Enforce platform-level administrator access."""
    if not current_user.is_platform_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform administrator privileges required",
        )
    return current_user


async def verify_workspace_access(
    workspace_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkspaceContext:
    """Enforce strict multi-tenant boundary. Ensures user belongs to workspace."""
    # Check workspace existence
    ws_result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    workspace = ws_result.scalars().first()
    if not workspace or not workspace.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or inactive",
        )

    # Platform admins bypass tenancy restriction with platform_admin role
    if current_user.is_platform_admin:
        return WorkspaceContext(
            workspace=workspace,
            role=WorkspaceRole.PLATFORM_ADMIN,
            user=current_user,
        )

    # Verify membership
    mem_result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == current_user.id,
        )
    )
    membership = mem_result.scalars().first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You are not a member of this workspace",
        )

    return WorkspaceContext(
        workspace=workspace,
        role=membership.role,
        user=current_user,
    )


def require_workspace_roles(allowed_roles: List[WorkspaceRole]):
    """Role-Based Access Control decorator factory for workspace operations."""

    def role_checker(
        context: WorkspaceContext = Depends(verify_workspace_access),
    ) -> WorkspaceContext:
        if context.role == WorkspaceRole.PLATFORM_ADMIN:
            return context
        if context.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires one of the following roles: {[r.value for r in allowed_roles]}",
            )
        return context

    return role_checker

