from decimal import Decimal

import razorpay
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.db.base import new_uuid
from app.models.billing import Invoice, InvoiceOrder, InvoiceStatusEnum, Payment, PaymentMethodEnum, PaymentStatusEnum
from app.models.order import Order, OrderItem, OrderStatusEnum
from app.models.site_settings import SiteSettings
from app.models.table import RestaurantTable
from app.realtime.events import InvoiceCreatedEvent, InvoiceUpdatedEvent
from app.realtime.manager import connection_manager
from app.schemas.billing import InvoiceCreate, InvoiceRead, OrderPrepayConfirm, PrepaidOrderRead, RazorpayVerify, RecordPayment
from app.schemas.order import OrderCreate, OrderRead
from app.services import orders as orders_service
from app.services import promotions as promotions_service
from app.services.orders import order_to_read


def _razorpay_client() -> razorpay.Client:
    settings = get_settings()
    if not (settings.razorpay_key_id and settings.razorpay_key_secret):
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Online payment is not configured")
    return razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


async def _load_invoice(db: AsyncSession, restaurant_id: str, invoice_id: str) -> Invoice:
    result = await db.execute(
        select(Invoice)
        .options(
            selectinload(Invoice.payments),
            selectinload(Invoice.order_links).selectinload(InvoiceOrder.order).selectinload(Order.items).selectinload(
                OrderItem.addons
            ),
            selectinload(Invoice.order_links).selectinload(InvoiceOrder.order).selectinload(Order.table),
            selectinload(Invoice.table),
        )
        .where(Invoice.id == invoice_id, Invoice.restaurant_id == restaurant_id)
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Invoice not found")
    return invoice


def invoice_to_read(invoice: Invoice) -> InvoiceRead:
    orders = [order_to_read(link.order, invoice.table.code) for link in invoice.order_links]
    data = InvoiceRead.model_validate(invoice)
    data.orders = orders
    return data


async def create_invoice(
    db: AsyncSession, restaurant_id: str, table_id: str, payload: InvoiceCreate, require_served: bool = True
) -> InvoiceRead:
    if not payload.order_ids:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Select at least one order to bill")

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id.in_(payload.order_ids), Order.restaurant_id == restaurant_id, Order.table_id == table_id)
    )
    orders = list(result.scalars().all())
    if len(orders) != len(payload.order_ids):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "One or more orders not found for this table")
    # Staff billing a table only bills food that's actually gone out. That
    # doesn't apply to the guest-initiated pay-online-first flow, where
    # payment happens before the kitchen even starts (see confirm_order_payment).
    if require_served and any(o.status != OrderStatusEnum.served for o in orders):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Only served orders can be billed")

    already_billed = await db.execute(
        select(InvoiceOrder.order_id).where(InvoiceOrder.order_id.in_(payload.order_ids))
    )
    if already_billed.scalars().first():
        raise HTTPException(status.HTTP_409_CONFLICT, "One or more orders are already on another bill")

    settings_row = (
        await db.execute(select(SiteSettings).where(SiteSettings.restaurant_id == restaurant_id))
    ).scalar_one()

    subtotal = sum((o.total for o in orders), Decimal("0"))

    discount_amount = Decimal("0")
    coupon = None
    if payload.coupon_code:
        coupon = await promotions_service.get_valid_coupon(db, restaurant_id, payload.coupon_code, subtotal)
        unit_prices = [
            item.unit_price_snapshot for o in orders for item in o.items for _ in range(item.quantity)
        ]
        discount_amount = promotions_service.compute_coupon_discount(coupon, subtotal, unit_prices)

    loyalty_redeemed = Decimal("0")
    if payload.loyalty_phone and payload.redeem_points > 0:
        account = await promotions_service.get_or_create_loyalty_account(db, restaurant_id, payload.loyalty_phone)
        points_to_use = min(payload.redeem_points, account.points)
        remaining_before_loyalty = max(subtotal - discount_amount, Decimal("0"))
        loyalty_redeemed, points_spent = promotions_service.compute_redeemable_amount(
            points_to_use, settings_row.loyalty_redeem_rate, remaining_before_loyalty
        )
        account.points -= points_spent

    taxable = max(subtotal - discount_amount - loyalty_redeemed, Decimal("0"))
    tax_amount = (taxable * settings_row.tax_rate / Decimal(100)).quantize(Decimal("0.01"))
    total = taxable + tax_amount

    invoice = Invoice(
        restaurant_id=restaurant_id,
        table_id=table_id,
        subtotal=subtotal,
        coupon_code=coupon.code if coupon else None,
        discount_amount=discount_amount,
        loyalty_redeemed_amount=loyalty_redeemed,
        loyalty_phone=payload.loyalty_phone,
        tax_rate=settings_row.tax_rate,
        tax_amount=tax_amount,
        total=total,
        status=InvoiceStatusEnum.unpaid,
    )
    db.add(invoice)
    await db.flush()
    for order in orders:
        db.add(InvoiceOrder(invoice_id=invoice.id, order_id=order.id))

    if coupon:
        await promotions_service.mark_coupon_used(db, coupon)

    await db.commit()

    table = await db.get(RestaurantTable, table_id)
    invoice_full = await _load_invoice(db, restaurant_id, invoice.id)
    read = invoice_to_read(invoice_full)
    await connection_manager.broadcast_staff(InvoiceCreatedEvent(invoice=read))
    await connection_manager.broadcast_table(table.code, InvoiceCreatedEvent(invoice=read))
    return read


async def get_invoice(db: AsyncSession, restaurant_id: str, invoice_id: str) -> InvoiceRead:
    invoice = await _load_invoice(db, restaurant_id, invoice_id)
    return invoice_to_read(invoice)


def _recompute_status(invoice: Invoice) -> None:
    paid_sum = sum((p.amount for p in invoice.payments if p.status == PaymentStatusEnum.succeeded), Decimal("0"))
    if paid_sum <= 0:
        invoice.status = InvoiceStatusEnum.unpaid
    elif paid_sum < invoice.total:
        invoice.status = InvoiceStatusEnum.partial
    else:
        invoice.status = InvoiceStatusEnum.paid


async def _finalize_if_paid(db: AsyncSession, restaurant_id: str, invoice: Invoice) -> None:
    """Credits loyalty points the moment an invoice becomes fully paid."""
    if invoice.status != InvoiceStatusEnum.paid or not invoice.loyalty_phone:
        return
    settings_row = (
        await db.execute(select(SiteSettings).where(SiteSettings.restaurant_id == restaurant_id))
    ).scalar_one()
    points_earned = int((invoice.total * settings_row.loyalty_points_per_currency).to_integral_value())
    if points_earned > 0:
        account = await promotions_service.get_or_create_loyalty_account(db, restaurant_id, invoice.loyalty_phone)
        account.points += points_earned


async def record_payment(
    db: AsyncSession, restaurant_id: str, invoice_id: str, payload: RecordPayment
) -> InvoiceRead:
    invoice = await _load_invoice(db, restaurant_id, invoice_id)
    if invoice.status == InvoiceStatusEnum.paid:
        raise HTTPException(status.HTTP_409_CONFLICT, "Invoice is already fully paid")

    db.add(Payment(invoice_id=invoice.id, method=payload.method, amount=payload.amount, status=PaymentStatusEnum.succeeded))
    await db.flush()
    await db.refresh(invoice, attribute_names=["payments"])
    _recompute_status(invoice)
    await _finalize_if_paid(db, restaurant_id, invoice)
    await db.commit()

    invoice_full = await _load_invoice(db, restaurant_id, invoice.id)
    read = invoice_to_read(invoice_full)
    await connection_manager.broadcast_staff(InvoiceUpdatedEvent(invoice=read))
    await connection_manager.broadcast_table(invoice_full.table.code, InvoiceUpdatedEvent(invoice=read))
    return read


async def demo_pay(db: AsyncSession, restaurant_id: str, invoice_id: str) -> InvoiceRead:
    """Simulates a successful online payment for demos/client walkthroughs
    when no real payment gateway is configured yet. Refuses to run once
    Razorpay keys are set, so it can never be used to skip a real charge."""
    settings = get_settings()
    if settings.razorpay_key_id and settings.razorpay_key_secret:
        raise HTTPException(status.HTTP_409_CONFLICT, "Demo payment is disabled once online payment is configured")

    invoice = await _load_invoice(db, restaurant_id, invoice_id)
    if invoice.status == InvoiceStatusEnum.paid:
        raise HTTPException(status.HTTP_409_CONFLICT, "Invoice is already fully paid")

    paid_sum = sum((p.amount for p in invoice.payments if p.status == PaymentStatusEnum.succeeded), Decimal("0"))
    remaining = invoice.total - paid_sum
    if remaining <= 0:
        raise HTTPException(status.HTTP_409_CONFLICT, "Nothing left to pay on this invoice")

    db.add(Payment(invoice_id=invoice.id, method=PaymentMethodEnum.card, amount=remaining, status=PaymentStatusEnum.succeeded))
    await db.flush()
    await db.refresh(invoice, attribute_names=["payments"])
    _recompute_status(invoice)
    await _finalize_if_paid(db, restaurant_id, invoice)
    await db.commit()

    invoice_full = await _load_invoice(db, restaurant_id, invoice.id)
    read = invoice_to_read(invoice_full)
    await connection_manager.broadcast_staff(InvoiceUpdatedEvent(invoice=read))
    await connection_manager.broadcast_table(invoice_full.table.code, InvoiceUpdatedEvent(invoice=read))
    return read


async def _price_cart_with_tax(db: AsyncSession, restaurant_id: str, order_payload: OrderCreate) -> Decimal:
    subtotal = await orders_service.compute_order_total(db, restaurant_id, order_payload)
    settings_row = (
        await db.execute(select(SiteSettings).where(SiteSettings.restaurant_id == restaurant_id))
    ).scalar_one()
    tax_amount = (subtotal * settings_row.tax_rate / Decimal(100)).quantize(Decimal("0.01"))
    return subtotal + tax_amount


async def create_standalone_razorpay_order(amount: Decimal) -> tuple[str, int, str]:
    """A Razorpay order not yet tied to one of our Invoice rows — used to
    charge a cart before the guest's Order (and therefore any Invoice) exists."""
    client = _razorpay_client()
    amount_paise = int((amount * 100).to_integral_value())
    rp_order = client.order.create({"amount": amount_paise, "currency": "INR", "receipt": f"cart-{new_uuid()}"})
    return rp_order["id"], amount_paise, get_settings().razorpay_key_id  # type: ignore[return-value]


async def prepare_order_payment(db: AsyncSession, restaurant_id: str, order_payload: OrderCreate) -> tuple[str, int, str]:
    """Pay-online-first flow, step 1: price the cart and open a Razorpay
    order for it, before the kitchen ever sees it."""
    await orders_service.get_active_table(db, order_payload.table.upper())
    total = await _price_cart_with_tax(db, restaurant_id, order_payload)
    return await create_standalone_razorpay_order(total)


async def _finalize_prepaid_order(
    db: AsyncSession, restaurant_id: str, order: OrderRead, table_id: str, payment: Payment
) -> PrepaidOrderRead:
    """Shared tail for both the real-Razorpay and demo prepay paths: the
    Order already exists and payment has already succeeded by the time this
    runs — just needs an Invoice to hang the Payment off of."""
    invoice = await create_invoice(
        db, restaurant_id, table_id, InvoiceCreate(order_ids=[order.id]), require_served=False
    )
    invoice_row = await _load_invoice(db, restaurant_id, invoice.id)

    payment.invoice_id = invoice_row.id
    payment.amount = invoice_row.total
    db.add(payment)
    await db.flush()
    await db.refresh(invoice_row, attribute_names=["payments"])
    _recompute_status(invoice_row)
    await _finalize_if_paid(db, restaurant_id, invoice_row)
    await db.commit()

    invoice_full = await _load_invoice(db, restaurant_id, invoice_row.id)
    read = invoice_to_read(invoice_full)
    await connection_manager.broadcast_staff(InvoiceUpdatedEvent(invoice=read))
    await connection_manager.broadcast_table(invoice_full.table.code, InvoiceUpdatedEvent(invoice=read))
    return PrepaidOrderRead(order=order, invoice=read)


async def confirm_order_payment(db: AsyncSession, restaurant_id: str, payload: OrderPrepayConfirm) -> PrepaidOrderRead:
    """Pay-online-first flow, step 2: verify the payment actually cleared,
    that the amount charged still matches this cart, and only then create
    the Order — the kitchen never sees an order that wasn't paid for."""
    client = _razorpay_client()
    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": payload.razorpay_order_id,
                "razorpay_payment_id": payload.razorpay_payment_id,
                "razorpay_signature": payload.razorpay_signature,
            }
        )
    except razorpay.errors.SignatureVerificationError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Payment verification failed") from exc

    rp_order = client.order.fetch(payload.razorpay_order_id)
    charged_paise = rp_order["amount"]

    table = await orders_service.get_active_table(db, payload.order.table.upper())
    total = await _price_cart_with_tax(db, restaurant_id, payload.order)
    expected_paise = int((total * 100).to_integral_value())
    if abs(expected_paise - charged_paise) > 1:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "The bill changed since payment was started — please review your cart and try again."
        )

    order = await orders_service.create_order(db, restaurant_id, payload.order)
    payment = Payment(
        method=PaymentMethodEnum.razorpay,
        amount=total,
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature,
        status=PaymentStatusEnum.succeeded,
    )
    return await _finalize_prepaid_order(db, restaurant_id, order, table.id, payment)


async def demo_prepay(db: AsyncSession, restaurant_id: str, order_payload: OrderCreate) -> PrepaidOrderRead:
    """Demo counterpart of confirm_order_payment for showcasing the
    pay-online-first flow without real Razorpay keys. Same guard as demo_pay:
    refuses to run once online payment is actually configured."""
    settings = get_settings()
    if settings.razorpay_key_id and settings.razorpay_key_secret:
        raise HTTPException(status.HTTP_409_CONFLICT, "Demo payment is disabled once online payment is configured")

    table = await orders_service.get_active_table(db, order_payload.table.upper())
    order = await orders_service.create_order(db, restaurant_id, order_payload)
    payment = Payment(method=PaymentMethodEnum.card, amount=Decimal("0"), status=PaymentStatusEnum.succeeded)
    return await _finalize_prepaid_order(db, restaurant_id, order, table.id, payment)


async def create_razorpay_order(db: AsyncSession, restaurant_id: str, invoice_id: str) -> tuple[str, int, str]:
    invoice = await _load_invoice(db, restaurant_id, invoice_id)
    paid_sum = sum((p.amount for p in invoice.payments if p.status == PaymentStatusEnum.succeeded), Decimal("0"))
    remaining = invoice.total - paid_sum
    if remaining <= 0:
        raise HTTPException(status.HTTP_409_CONFLICT, "Nothing left to pay on this invoice")

    client = _razorpay_client()
    amount_paise = int((remaining * 100).to_integral_value())
    rp_order = client.order.create({"amount": amount_paise, "currency": "INR", "receipt": invoice.id})

    db.add(
        Payment(
            invoice_id=invoice.id,
            method=PaymentMethodEnum.razorpay,
            amount=remaining,
            razorpay_order_id=rp_order["id"],
            status=PaymentStatusEnum.pending,
        )
    )
    await db.commit()
    return rp_order["id"], amount_paise, get_settings().razorpay_key_id  # type: ignore[return-value]


async def verify_razorpay_payment(
    db: AsyncSession, restaurant_id: str, invoice_id: str, payload: RazorpayVerify
) -> InvoiceRead:
    invoice = await _load_invoice(db, restaurant_id, invoice_id)
    payment = next((p for p in invoice.payments if p.razorpay_order_id == payload.razorpay_order_id), None)
    if not payment or payment.status != PaymentStatusEnum.pending:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No matching pending payment for this order")

    client = _razorpay_client()
    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": payload.razorpay_order_id,
                "razorpay_payment_id": payload.razorpay_payment_id,
                "razorpay_signature": payload.razorpay_signature,
            }
        )
    except razorpay.errors.SignatureVerificationError as exc:
        payment.status = PaymentStatusEnum.failed
        await db.commit()
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Payment verification failed") from exc

    payment.status = PaymentStatusEnum.succeeded
    payment.razorpay_payment_id = payload.razorpay_payment_id
    payment.razorpay_signature = payload.razorpay_signature
    await db.flush()
    await db.refresh(invoice, attribute_names=["payments"])
    _recompute_status(invoice)
    await _finalize_if_paid(db, restaurant_id, invoice)
    await db.commit()

    invoice_full = await _load_invoice(db, restaurant_id, invoice.id)
    read = invoice_to_read(invoice_full)
    await connection_manager.broadcast_staff(InvoiceUpdatedEvent(invoice=read))
    await connection_manager.broadcast_table(invoice_full.table.code, InvoiceUpdatedEvent(invoice=read))
    return read


async def finalize_from_webhook(db: AsyncSession, razorpay_order_id: str, razorpay_payment_id: str) -> None:
    """Called from the Razorpay webhook — no restaurant scoping is available
    from the webhook payload itself, so we look the payment up globally by
    its (unique) razorpay_order_id and derive the restaurant from there."""
    result = await db.execute(select(Payment).where(Payment.razorpay_order_id == razorpay_order_id))
    payment = result.scalar_one_or_none()
    if not payment or payment.status != PaymentStatusEnum.pending:
        return

    invoice = await db.get(Invoice, payment.invoice_id)
    payment.status = PaymentStatusEnum.succeeded
    payment.razorpay_payment_id = razorpay_payment_id
    await db.flush()
    await db.refresh(invoice, attribute_names=["payments"])
    _recompute_status(invoice)
    await _finalize_if_paid(db, invoice.restaurant_id, invoice)
    await db.commit()

    invoice_full = await _load_invoice(db, invoice.restaurant_id, invoice.id)
    read = invoice_to_read(invoice_full)
    await connection_manager.broadcast_staff(InvoiceUpdatedEvent(invoice=read))
    await connection_manager.broadcast_table(invoice_full.table.code, InvoiceUpdatedEvent(invoice=read))


async def refund_payment(db: AsyncSession, restaurant_id: str, payment_id: str) -> InvoiceRead:
    payment = await db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Payment not found")
    invoice = await _load_invoice(db, restaurant_id, payment.invoice_id)

    if payment.status != PaymentStatusEnum.succeeded:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Only a succeeded payment can be refunded")

    if payment.method == PaymentMethodEnum.razorpay and payment.razorpay_payment_id:
        client = _razorpay_client()
        client.payment.refund(payment.razorpay_payment_id, {"amount": int(payment.amount * 100)})

    payment.status = PaymentStatusEnum.refunded
    await db.flush()
    await db.refresh(invoice, attribute_names=["payments"])
    invoice.status = InvoiceStatusEnum.refunded
    await db.commit()

    invoice_full = await _load_invoice(db, restaurant_id, invoice.id)
    read = invoice_to_read(invoice_full)
    await connection_manager.broadcast_staff(InvoiceUpdatedEvent(invoice=read))
    return read
