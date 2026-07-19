import enum
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, new_uuid


class InvoiceStatusEnum(str, enum.Enum):
    unpaid = "unpaid"
    partial = "partial"
    paid = "paid"
    refunded = "refunded"


class PaymentMethodEnum(str, enum.Enum):
    cash = "cash"
    card = "card"
    upi = "upi"
    razorpay = "razorpay"


class PaymentStatusEnum(str, enum.Enum):
    pending = "pending"
    succeeded = "succeeded"
    failed = "failed"
    refunded = "refunded"


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    restaurant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), index=True
    )
    table_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurant_tables.id", ondelete="RESTRICT"), index=True
    )

    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    coupon_code: Mapped[str | None] = mapped_column(String(40), nullable=True)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    loyalty_redeemed_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    loyalty_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2))

    status: Mapped[InvoiceStatusEnum] = mapped_column(
        Enum(InvoiceStatusEnum, native_enum=False, length=20), default=InvoiceStatusEnum.unpaid, index=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    table: Mapped["RestaurantTable"] = relationship()  # noqa: F821
    order_links: Mapped[list["InvoiceOrder"]] = relationship(
        back_populates="invoice", cascade="all, delete-orphan"
    )
    payments: Mapped[list["Payment"]] = relationship(back_populates="invoice", cascade="all, delete-orphan")


class InvoiceOrder(Base):
    """An invoice can cover several orders from the same table's sitting."""

    __tablename__ = "invoice_orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    invoice_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("invoices.id", ondelete="CASCADE"), index=True
    )
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id", ondelete="RESTRICT"), index=True)

    invoice: Mapped[Invoice] = relationship(back_populates="order_links")
    order: Mapped["Order"] = relationship()  # noqa: F821


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    invoice_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("invoices.id", ondelete="CASCADE"), index=True
    )
    method: Mapped[PaymentMethodEnum] = mapped_column(Enum(PaymentMethodEnum, native_enum=False, length=20))
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    razorpay_order_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    razorpay_signature: Mapped[str | None] = mapped_column(String(300), nullable=True)
    status: Mapped[PaymentStatusEnum] = mapped_column(
        Enum(PaymentStatusEnum, native_enum=False, length=20), default=PaymentStatusEnum.pending, index=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    invoice: Mapped[Invoice] = relationship(back_populates="payments")
