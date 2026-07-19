from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_order_staff
from app.core.tenant import get_current_restaurant
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.schemas.billing import OrderPrepayConfirm, PrepaidOrderRead, RazorpayOrderRead
from app.schemas.order import OrderCreate, OrderRead, OrderStatusUpdate
from app.services import billing as billing_service
from app.services import orders as orders_service

router = APIRouter(tags=["orders"])


@router.post("/orders", response_model=OrderRead)
async def place_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> OrderRead:
    return await orders_service.create_order(db, restaurant.id, payload)


@router.post("/orders/prepare-payment", response_model=RazorpayOrderRead)
async def prepare_order_payment(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> RazorpayOrderRead:
    """Pay-online-first, step 1: price the cart and open a Razorpay order for
    it — the Order itself isn't created until confirm-payment succeeds."""
    order_id, amount_paise, key_id = await billing_service.prepare_order_payment(db, restaurant.id, payload)
    return RazorpayOrderRead(razorpay_order_id=order_id, amount_paise=amount_paise, key_id=key_id)


@router.post("/orders/confirm-payment", response_model=PrepaidOrderRead)
async def confirm_order_payment(
    payload: OrderPrepayConfirm,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> PrepaidOrderRead:
    """Pay-online-first, step 2: verify the payment, then create the Order
    and mark it paid in one shot."""
    return await billing_service.confirm_order_payment(db, restaurant.id, payload)


@router.post("/orders/demo-prepay", response_model=PrepaidOrderRead)
async def demo_prepay_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> PrepaidOrderRead:
    """Demo counterpart of confirm-payment for client walkthroughs without
    real Razorpay keys — see billing_service.demo_prepay."""
    return await billing_service.demo_prepay(db, restaurant.id, payload)


@router.get("/orders", response_model=list[OrderRead])
async def get_orders_for_table(
    table: str,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> list[OrderRead]:
    return await orders_service.list_orders_for_table(db, restaurant.id, table)


admin_router = APIRouter(prefix="/admin", tags=["admin-orders"], dependencies=[Depends(require_order_staff)])


@admin_router.get("/orders", response_model=list[OrderRead])
async def admin_list_orders(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant)
) -> list[OrderRead]:
    return await orders_service.list_all_orders(db, restaurant.id)


@admin_router.patch("/orders/{order_id}/status", response_model=OrderRead)
async def admin_update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> OrderRead:
    return await orders_service.update_order_status(db, restaurant.id, order_id, payload.status)
