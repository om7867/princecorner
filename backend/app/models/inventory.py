import enum
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, new_uuid


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    restaurant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(200))
    contact_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(200), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Ingredient(Base):
    __tablename__ = "ingredients"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    restaurant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), index=True
    )
    supplier_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(200))
    unit: Mapped[str] = mapped_column(String(20))  # "kg", "L", "pcs", ...
    stock_quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    low_stock_threshold: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    supplier: Mapped[Supplier | None] = relationship()


class MenuItemIngredient(Base):
    """Recipe row: how much of one ingredient a single serving of a menu
    item uses. Auto-deducted from stock when an order is placed."""

    __tablename__ = "menu_item_ingredients"
    __table_args__ = (UniqueConstraint("menu_item_id", "ingredient_id", name="uq_recipe_line"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    menu_item_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("menu_items.id", ondelete="CASCADE"), index=True
    )
    ingredient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("ingredients.id", ondelete="CASCADE"), index=True
    )
    quantity_per_serving: Mapped[Decimal] = mapped_column(Numeric(10, 3))

    ingredient: Mapped[Ingredient] = relationship()


class TransferStatusEnum(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    completed = "completed"


class InventoryTransferRequest(Base):
    """A branch's request to receive stock from a sibling branch. Ingredients
    are branch-scoped rows with no shared catalog, so the request references
    an ingredient by name — on approval, `services/inventory.py` deducts from
    the source branch's matching ingredient (case-insensitive name) and
    credits the destination's (creating the row there if it doesn't exist)."""

    __tablename__ = "inventory_transfer_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    organization_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    from_restaurant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), index=True
    )
    to_restaurant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), index=True
    )
    ingredient_name: Mapped[str] = mapped_column(String(200))
    unit: Mapped[str] = mapped_column(String(20))
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    status: Mapped[TransferStatusEnum] = mapped_column(
        Enum(TransferStatusEnum, native_enum=False, length=20), default=TransferStatusEnum.pending
    )
    requested_by_user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE")
    )
    note: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
