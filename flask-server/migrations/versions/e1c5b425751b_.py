"""empty message

Revision ID: e1c5b425751b
Revises: 
Create Date: 2024-08-28 10:35:31.988620

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e1c5b425751b'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('car',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('car_name', sa.String(length=100), nullable=False),
    sa.Column('year', sa.Integer(), nullable=False),
    sa.Column('finn_price', sa.Integer(), nullable=False),
    sa.Column('finn_link', sa.String(length=200), nullable=False),
    sa.Column('image_url', sa.String(length=200), nullable=False),
    sa.Column('regno', sa.String(length=20), nullable=False),
    sa.Column('mileage', sa.Integer(), nullable=False),
    sa.Column('olx_prices', sa.ARRAY(sa.Integer()), nullable=False),
    sa.Column('olx_ids', sa.ARRAY(sa.Integer()), nullable=False),
    sa.Column('olx_names', sa.ARRAY(sa.String()), nullable=False),
    sa.Column('olx_images', sa.ARRAY(sa.String()), nullable=False),
    sa.Column('olx_mileages', sa.ARRAY(sa.String()), nullable=False),
    sa.Column('tax_return', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=80), nullable=False),
    sa.Column('password', sa.String(length=256), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('username')
    )
    op.create_table('favorite',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('car_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['car_id'], ['car.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('favorite')
    op.drop_table('user')
    op.drop_table('car')
    # ### end Alembic commands ###
