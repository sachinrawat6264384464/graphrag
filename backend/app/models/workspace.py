"""Workspace and Multi-Tenant RBAC models."""

import enum
import uuid
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Enum as SQLEnum, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from backend.app.models.user import User


class WorkspaceRole(str, enum.Enum):
    """Role-Based Access Control inside a Workspace tenant."""

    PLATFORM_ADMIN = "platform_admin"
    WORKSPACE_ADMIN = "workspace_admin"
    EDITOR = "editor"
    VIEWER = "viewer"


class Workspace(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Multi-tenant isolation boundary."""

    __tablename__ = "workspaces"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    slug: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
    )

    # Relationships
    members: Mapped[List["WorkspaceMember"]] = relationship(
        "WorkspaceMember",
        back_populates="workspace",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class WorkspaceMember(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Membership mapping user to workspace with specific RBAC role."""

    __tablename__ = "workspace_members"
    __table_args__ = (
        UniqueConstraint("workspace_id", "user_id", name="uq_workspace_member"),
    )

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[WorkspaceRole] = mapped_column(
        SQLEnum(WorkspaceRole, native_enum=False, length=50),
        default=WorkspaceRole.EDITOR,
        nullable=False,
    )

    # Relationships
    workspace: Mapped["Workspace"] = relationship(
        "Workspace",
        back_populates="members",
        lazy="selectin",
    )
    user: Mapped["User"] = relationship(
        "User",
        back_populates="workspace_memberships",
        lazy="selectin",
    )

