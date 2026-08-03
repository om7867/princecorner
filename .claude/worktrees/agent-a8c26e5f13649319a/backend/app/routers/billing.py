import razorpay
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.deps import require_billing_staff, require_owner_admin
from app.core.tenant import get_current_restaurant_for_staff, get_current_restaurant_public
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.schemas.billing import InvoiceCreate, InvoiceRead, RazorpayOrderRead, RazorpayVerify, RecordPayment
from app.services import billing as billing_service

router = APIRouter(tags=["billing"])

admin_router = APIRouter(prefix="/admin", tags=["admin-billing"], dependencies=[Depends(require_billing_staff)])


@admin_router.post("/tables/{table_id}/invoice", response_model=InvoiceRead)
async def create_invoice(
    table_id: str,
    payload: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
) -> InvoiceRead:
    return await billing_service.create_invoice(db, restaurant.id, table_id, payload)


@admin_router.post("/invoices/{invoice_id}/payments", response_model=InvoiceRead)
async def record_payment(
    invoice_id: str,
    payload: RecordPayment,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
) -> InvoiceRead:
    return await billing_service.record_payment(db, restaurant.id, invoice_id, payload)


@admin_router.post("/invoices/{invoice_id}/razorpay-confirm", response_model=InvoiceRead)
async def confirm_razorpay(
    invoice_id: str,
    payload: RazorpayVerify,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
) -> InvoiceRead:
    """Staff-side fallback confirmation if the guest's browser closed before
    the client-side verify call completed."""
    return await billing_service.verify_razorpay_payment(db, restaurant.id, invoice_id, payload)


refund_router = APIRouter(prefix="/admin", tags=["admin-billing"], dependencies=[Depends(require_owner_admin)])


@refund_router.post("/payments/{payment_id}/refund", response_model=InvoiceRead)
async def refund_payment(
    payment_id: str, db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_for_staff)
) -> InvoiceRead:
    return await billing_service.refund_payment(db, restaurant.id, payment_id)


@router.get("/invoices/{invoice_id}", response_model=InvoiceRead)
async def get_invoice(
    invoice_id: str, db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_public)
) -> InvoiceRead:
    return await billing_service.get_invoice(db, restaurant.id, invoice_id)


@router.post("/invoices/{invoice_id}/demo-pay", response_model=InvoiceRead)
async def demo_pay(
    invoice_id: str, db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_public)
) -> InvoiceRead:
    """Sandbox payment for demos/client walkthroughs — see billing_service.demo_pay."""
    return await billing_service.demo_pay(db, restaurant.id, invoice_id)


@router.post("/invoices/{invoice_id}/razorpay-order", response_model=RazorpayOrderRead)
async def create_razorpay_order(
    invoice_id: str, db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_public)
) -> RazorpayOrderRead:
    order_id, amount_paise, key_id = await billing_service.create_razorpay_order(db, restaurant.id, invoice_id)
    return RazorpayOrderRead(razorpay_order_id=order_id, amount_paise=amount_paise, key_id=key_id)


@router.post("/invoices/{invoice_id}/razorpay-verify", response_model=InvoiceRead)
async def verify_razorpay(
    invoice_id: str,
    payload: RazorpayVerify,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_public),
) -> InvoiceRead:
    return await billing_service.verify_razorpay_payment(db, restaurant.id, invoice_id, payload)


@router.post("/webhooks/razorpay")
async def razorpay_webhook(request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    """Production-hardening path: verifies the webhook signature and
    finalizes payment the same way as the client-confirm endpoint above, for
    reliability when the guest's browser can't be trusted to complete the
    round trip (closed tab, lost connection, etc.)."""
    settings = get_settings()
    if not settings.razorpay_webhook_secret:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Webhook not configured")

    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    client = razorpay.Client(auth=(settings.razorpay_key_id or "", settings.razorpay_key_secret or ""))
    try:
        client.utility.verify_webhook_signature(body.decode(), signature, settings.razorpay_webhook_secret)
    except razorpay.errors.SignatureVerificationError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid webhook signature") from exc

    payload = await request.json()
    entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    order_id = entity.get("order_id")
    payment_id = entity.get("id")
    if order_id and payment_id and payload.get("event") == "payment.captured":
        await billing_service.finalize_from_webhook(db, order_id, payment_id)
    return {"ok": True}
