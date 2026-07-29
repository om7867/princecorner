import enum
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, new_uuid


class OrderStatusEnum(str, enum.Enum):
    received = "received"
    preparing = "preparing"
    ready = "ready"
    served = "served"
    cancelled = "cancelled"


class OrderChannelEnum(str, enum.Enum):
    """How the order was placed — dine_in is a real table scanned via QR;
    online is placed through a branch's "Order Online" entry point with no
    physical table (attached to that branch's virtual `ONLINE` table row).
    Purely informational for admin display/filtering — the ordering/kitchen
    flow itself is identical either way."""

    dine_in = "dine_in"
    online = "online"


STATUS_FLOW: list[OrderStatusEnum] = [
    OrderStatusEnum.received,
    OrderStatusEnum.preparing,
    OrderStatusEnum.ready,
    OrderStatusEnum.served,
]


def next_status(status: OrderStatusEnum) -> OrderStatusEnum | None:
    i = STATUS_FLOW.index(status)
    return STATUS_FLOW[i + 1] if i < len(STATUS_FLOW) - 1 else None


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (Index("ix_orders_restaurant_status_created", "restaurant_id", "status", "created_at"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    restaurant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), index=True
    )
    table_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurant_tables.id", ondelete="RESTRICT"), index=True
    )
    display_code: Mapped[str] = mapped_column(String(20), unique=True)

    status: Mapped[OrderStatusEnum] = mapped_column(
        Enum(OrderStatusEnum, native_enum=False, length=20), default=OrderStatusEnum.received, index=True
    )
    channel: Mapped[OrderChannelEnum] = mapped_column(
        Enum(OrderChannelEnum, native_enum=False, length=20), default=OrderChannelEnum.dine_in
    )
    note: Mapped[str] = mapped_column(String(1000), default="")

    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    table: Mapped["RestaurantTable"] = relationship()  # noqa: F821
    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    menu_item_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("menu_items.id", ondelete="SET NULL"), nullable=True
    )
    variant_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("menu_item_variants.id", ondelete="SET NULL"), nullable=True
    )

    name_snapshot: Mapped[str] = mapped_column(String(200))
    unit_price_snapshot: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    quantity: Mapped[int] = mapped_column(Integer)
    line_total: Mapped[Decimal] = mapped_column(Numeric(10, 2))

    order: Mapped[Order] = relationship(back_populates="items")
    addons: Mapped[list["OrderItemAddon"]] = relationship(
        back_populates="order_item", cascade="all, delete-orphan"
    )


class OrderItemAddon(Base):
    __tablename__ = "order_item_addons"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    order_item_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("order_items.id", ondelete="CASCADE"), index=True
    )
    addon_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("menu_item_addons.id", ondelete="SET NULL"), nullable=True
    )
    name_snapshot: Mapped[str] = mapped_column(String(100))
    price_snapshot: Mapped[Decimal] = mapped_column(Numeric(10, 2))

    order_item: Mapped[OrderItem] = relationship(back_populates="addons")
