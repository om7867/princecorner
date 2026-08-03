from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, computed_field

from app.models.billing import InvoiceStatusEnum, PaymentMethodEnum, PaymentStatusEnum
from app.schemas.order import OrderCreate, OrderRead


class InvoiceCreate(BaseModel):
    order_ids: list[str]
    coupon_code: str | None = None
    loyalty_phone: str | None = None
    redeem_points: int = 0


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    method: PaymentMethodEnum
    amount: Decimal
    status: PaymentStatusEnum
    created_at: datetime


class InvoiceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    table_code: str = ""
    subtotal: Decimal
    coupon_code: str | None
    discount_amount: Decimal
    loyalty_redeemed_amount: Decimal
    loyalty_phone: str | None
    tax_rate: Decimal
    tax_amount: Decimal
    total: Decimal
    status: InvoiceStatusEnum
    created_at: datetime
    orders: list[OrderRead] = []
    payments: list[PaymentRead] = []

    @computed_field
    @property
    def amount_paid(self) -> Decimal:
        return sum((p.amount for p in self.payments if p.status.value == "succeeded"), Decimal("0"))


class RecordPayment(BaseModel):
    method: PaymentMethodEnum
    amount: Decimal


class RazorpayOrderRead(BaseModel):
    razorpay_order_id: str
    amount_paise: int
    currency: str = "INR"
    key_id: str


class RazorpayVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class OrderPrepayConfirm(BaseModel):
    """Pay-online-first checkout: the guest's cart, plus the Razorpay
    confirmation for a payment already taken for it. The Order row only
    gets created once this verifies — see billing_service.confirm_order_payment."""

    order: OrderCreate
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PrepaidOrderRead(BaseModel):
    order: OrderRead
    invoice: InvoiceRead
