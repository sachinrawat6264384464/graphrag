"""User database model."""

from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from backend.app.models.workspace import WorkspaceMember


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """NexusAI User record."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    full_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    is_platform_admin: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # Relationships
    workspace_memberships: Mapped[List["WorkspaceMember"]] = relationship(
        "WorkspaceMember",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

