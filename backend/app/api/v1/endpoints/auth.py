"""Authentication Endpoints (Register, Login, Me)."""

import re
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.api.deps import get_current_user
from backend.app.core.security import create_access_token, get_password_hash, verify_password
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole
from backend.app.schemas.token import Token
from backend.app.schemas.user import (
    UserCreate,
    UserLogin,
    UserProfileResponse,
    UserResponse,
)
from backend.app.schemas.workspace import WorkspaceResponse

router = APIRouter()


def slugify(text: str) -> str:
    """Generate clean URL-friendly slug."""
    text = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "-", text)


@router.post(
    "/register",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User & Provision Default Workspace",
)
async def register_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Register a new user, create their personal workspace, and issue JWT."""
    # Check if email is already taken
    existing = await db.execute(select(User).where(User.email == payload.email.lower()))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists",
        )

    # Hash password & create user
    user = User(
        email=payload.email.lower(),
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        is_active=True,
        is_platform_admin=False,
    )
    db.add(user)
    await db.flush()

    # Create default personal workspace for multi-tenant isolation
    username_part = payload.email.split("@")[0]
    base_slug = slugify(f"{username_part}-workspace")
    slug = base_slug

    # Ensure unique slug
    counter = 1
    while True:
        check_slug = await db.execute(select(Workspace).where(Workspace.slug == slug))
        if not check_slug.scalars().first():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    workspace = Workspace(
        name=f"{payload.full_name or username_part.capitalize()}'s Workspace",
        slug=slug,
        description="Personal workspace",
        is_active=True,
    )
    db.add(workspace)
    await db.flush()

    # Add user as workspace administrator
    membership = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=user.id,
        role=WorkspaceRole.WORKSPACE_ADMIN,
    )
    db.add(membership)
    await db.commit()
    await db.refresh(user)

    # Issue access token
    access_token = create_access_token(
        subject=str(user.id),
        claims={"email": user.email},
    )

    return {
        "user": UserResponse.model_validate(user),
        "workspace": WorkspaceResponse.model_validate(workspace),
        "token": Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=60 * 24 * 60,
        ),
    }


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate User & Obtain JWT Access Token",
)
async def login_user(
    payload: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Verify credentials and return JWT bearer access token."""
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalars().first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    access_token = create_access_token(
        subject=str(user.id),
        claims={"email": user.email},
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=60 * 24 * 60,
    )


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get Current User Profile & Accessible Workspaces",
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Retrieve authenticated user details along with accessible workspaces."""
    # Query accessible workspaces with user role
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

    return UserProfileResponse(
        user=UserResponse.model_validate(current_user),
        workspaces=workspaces,
    )

