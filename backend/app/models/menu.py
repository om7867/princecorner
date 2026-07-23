from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, new_uuid


class MenuCategory(Base):
    __tablename__ = "menu_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    restaurant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(100))
    slug: Mapped[str] = mapped_column(String(100))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    items: Mapped[list["MenuItem"]] = relationship(back_populates="category")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    restaurant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), index=True
    )
    category_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("menu_categories.id", ondelete="RESTRICT"), index=True
    )
    # Set when this row was pushed from a Super Admin's Global Menu template.
    # The branch-level update endpoint uses this to reject edits to
    # protected fields (name/description/category) while still allowing
    # local price/availability overrides ("Branch Menu Override").
    source_global_item_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("global_menu_items.id", ondelete="SET NULL"), nullable=True, index=True
    )

    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(String(2000), default="")
    base_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))

    dietary_tags: Mapped[list] = mapped_column(JSON, default=list)  # ["vegetarian", ...]
    model_tone: Mapped[str] = mapped_column(String(20), default="warm")  # cosmetic 3D passthrough
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    photo_alt: Mapped[str | None] = mapped_column(String(300), nullable=True)

    is_available: Mapped[bool] = mapped_column(Boolean, default=True)  # the 86 flag
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)  # soft-delete from admin editor
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    category: Mapped[MenuCategory] = relationship(back_populates="items")
    variants: Mapped[list["MenuItemVariant"]] = relationship(
        back_populates="menu_item", cascade="all, delete-orphan", order_by="MenuItemVariant.sort_order"
    )
    addons: Mapped[list["MenuItemAddon"]] = relationship(
        back_populates="menu_item", cascade="all, delete-orphan", order_by="MenuItemAddon.sort_order"
    )


class MenuItemVariant(Base):
    """Sizes: Small/Medium/Large, etc. Price is an absolute override, not a delta."""

    __tablename__ = "menu_item_variants"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    menu_item_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("menu_items.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(100))
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    menu_item: Mapped[MenuItem] = relationship(back_populates="variants")


class MenuItemAddon(Base):
    """Extras: cheese, olives, corn, etc."""

    __tablename__ = "menu_item_addons"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    menu_item_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("menu_items.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(100))
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    menu_item: Mapped[MenuItem] = relationship(back_populates="addons")


class GlobalMenuItem(Base):
    """A Super Admin's org-wide master menu item. Saving one pushes/updates a
    real `MenuItem` row (tagged via `source_global_item_id`) in every active
    branch of the organization — see `services/global_menu.py`. This table
    is the template; `MenuItem` rows are the per-branch working copies."""

    __tablename__ = "global_menu_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    organization_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(String(2000), default="")
    base_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    category_name: Mapped[str] = mapped_column(String(100))
    dietary_tags: Mapped[list] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
