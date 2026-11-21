"""create users and workspaces tables

Revision ID: ef52433362d9
Revises: 
Create Date: 2026-11-21 13:51:33.079383

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'ef52433362d9'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create NexusAI Users, Workspaces, and Workspace Members tables."""
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('is_platform_admin', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Workspaces table
    op.create_table(
        'workspaces',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_workspaces_slug'), 'workspaces', ['slug'], unique=True)

    # Workspace Members table
    op.create_table(
        'workspace_members',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('workspace_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('role', sa.Enum('PLATFORM_ADMIN', 'WORKSPACE_ADMIN', 'EDITOR', 'VIEWER', name='workspacerole', native_enum=False, length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('workspace_id', 'user_id', name='uq_workspace_member')
    )
    op.create_index(op.f('ix_workspace_members_user_id'), 'workspace_members', ['user_id'], unique=False)
    op.create_index(op.f('ix_workspace_members_workspace_id'), 'workspace_members', ['workspace_id'], unique=False)


def downgrade() -> None:
    """Downgrade NexusAI schema."""
    op.drop_index(op.f('ix_workspace_members_workspace_id'), table_name='workspace_members')
    op.drop_index(op.f('ix_workspace_members_user_id'), table_name='workspace_members')
    op.drop_table('workspace_members')
    op.drop_index(op.f('ix_workspaces_slug'), table_name='workspaces')
    op.drop_table('workspaces')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
