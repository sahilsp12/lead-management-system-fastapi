"""Initial migration

Revision ID: 65dfe898a9ee
Revises: 
Create Date: 2026-07-15 20:43:39.637155

"""

from typing import Sequence, Union

from alembic import op

import sqlalchemy as sa

revision: str = '65dfe898a9ee'

down_revision: Union[str, Sequence[str], None] = None

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:

    """Upgrade schema."""

    op.create_table('users',

    sa.Column('id', sa.Integer(), nullable=False),

    sa.Column('name', sa.String(length=100), nullable=False),

    sa.Column('email', sa.String(length=150), nullable=False),

    sa.Column('password', sa.String(length=255), nullable=False),

    sa.Column('role', sa.String(length=20), nullable=False),

    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),

    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),

    sa.PrimaryKeyConstraint('id')

    )

    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    op.create_table('leads',

    sa.Column('id', sa.Integer(), nullable=False),

    sa.Column('name', sa.String(length=100), nullable=False),

    sa.Column('email', sa.String(length=150), nullable=False),

    sa.Column('phone', sa.String(length=20), nullable=True),

    sa.Column('source', sa.String(length=50), nullable=True),

    sa.Column('status', sa.String(length=30), nullable=True),

    sa.Column('notes', sa.Text(), nullable=True),

    sa.Column('assigned_to', sa.Integer(), nullable=True),

    sa.Column('created_by', sa.Integer(), nullable=True),

    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),

    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),

    sa.ForeignKeyConstraint(['assigned_to'], ['users.id'], ),

    sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),

    sa.PrimaryKeyConstraint('id')

    )

    op.create_table('activity_logs',

    sa.Column('id', sa.Integer(), nullable=False),

    sa.Column('lead_id', sa.Integer(), nullable=True),

    sa.Column('user_id', sa.Integer(), nullable=True),

    sa.Column('action', sa.String(length=100), nullable=True),

    sa.Column('description', sa.String(length=255), nullable=True),

    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),

    sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ),

    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),

    sa.PrimaryKeyConstraint('id')

    )

def downgrade() -> None:

    """Downgrade schema."""

    op.drop_table('activity_logs')

    op.drop_table('leads')

    op.drop_index(op.f('ix_users_id'), table_name='users')

    op.drop_index(op.f('ix_users_email'), table_name='users')

    op.drop_table('users')

