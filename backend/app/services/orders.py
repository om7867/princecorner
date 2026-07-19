import random
import time as time_module
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.billing import InvoiceOrder
from app.models.menu import MenuItem, MenuItemAddon, MenuItemVariant
from app.models.order import Order, OrderItem, OrderItemAddon, OrderStatusEnum, next_status
from app.models.table import RestaurantTable
from app.realtime.events import OrderCreatedEvent, OrderUpdatedEvent
from app.realtime.manager import connection_manager
from app.schemas.order import OrderCreate, OrderRead
from app.services import inventory as inventory_service


def _display_code() -> str:
    return f"ORD-{int(time_module.time() * 1000):x}".upper() + f"{random.randint(10, 99)}"


async def get_active_table(db: AsyncSession, code: str) -> RestaurantTable:
    result = await db.execute(
        select(RestaurantTable).where(RestaurantTable.code == code, RestaurantTable.is_active.is_(True))
    )
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Unknown table")
    return table


def order_to_read(order: Order, table_code: str, is_billed: bool = False) -> OrderRead:
    data = OrderRead.model_validate(order)
    data.table_code = table_code
    data.is_billed = is_billed
    return data


async def compute_order_total(db: AsyncSession, restaurant_id: str, payload: OrderCreate) -> Decimal:
    """Pure pricing preview — same validation as create_order but no writes.
    Used to price a cart before payment, since the guest pays before the
    Order row exists in the pay-online-first flow."""
    if not payload.lines:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Cart is empty")

    total = Decimal("0")
    for line in payload.lines:
        item = await db.get(MenuItem, line.menu_item_id)
        if not item or not item.is_available or not item.is_active or item.restaurant_id != restaurant_id:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"Item unavailable: {line.menu_item_id}")

        unit_price = item.base_price
        if line.variant_id:
            variant = await db.get(MenuItemVariant, line.variant_id)
            if not variant or variant.menu_item_id != item.id:
                raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid variant")
            unit_price = variant.price

        line_total = unit_price * line.quantity
        for addon_id in line.addon_ids:
            addon = await db.get(MenuItemAddon, addon_id)
            if not addon or addon.menu_item_id != item.id or not addon.is_available:
                raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid addon")
            line_total += addon.price * line.quantity

        total += line_total
    return total


async def create_order(db: AsyncSession, restaurant_id: str, payload: OrderCreate) -> OrderRead:
    table = await get_active_table(db, payload.table.upper())
    if not payload.lines:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Cart is empty")

    order = Order(
        restaurant_id=restaurant_id,
        table_id=table.id,
        display_code=_display_code(),
        status=OrderStatusEnum.received,
        note=payload.note.strip()[:1000],
        subtotal=0,
        total=0,
    )

    subtotal = 0
    for line in payload.lines:
        item = await db.get(MenuItem, line.menu_item_id)
        if not item or not item.is_available or not item.is_active or item.restaurant_id != restaurant_id:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"Item unavailable: {line.menu_item_id}")

        unit_price = item.base_price
        name = item.name
        if line.variant_id:
            variant = await db.get(MenuItemVariant, line.variant_id)
            if not variant or variant.menu_item_id != item.id:
                raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid variant")
            unit_price = variant.price
            name = f"{item.name} ({variant.name})"

        order_item = OrderItem(
            menu_item_id=item.id,
            variant_id=line.variant_id,
            name_snapshot=name,
            unit_price_snapshot=unit_price,
            quantity=line.quantity,
            line_total=unit_price * line.quantity,
        )

        for addon_id in line.addon_ids:
            addon = await db.get(MenuItemAddon, addon_id)
            if not addon or addon.menu_item_id != item.id or not addon.is_available:
                raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid addon")
            order_item.addons.append(
                OrderItemAddon(addon_id=addon.id, name_snapshot=addon.name, price_snapshot=addon.price)
            )
            order_item.line_total += addon.price * line.quantity

        subtotal += order_item.line_total
        order.items.append(order_item)

    order.subtotal = subtotal
    order.total = subtotal

    db.add(order)
    for line in payload.lines:
        await inventory_service.deduct_stock_for_order_line(db, line.menu_item_id, line.quantity)
    await db.commit()
    await db.refresh(order, attribute_names=["items"])
    for oi in order.items:
        await db.refresh(oi, attribute_names=["addons"])

    read = order_to_read(order, table.code)
    await connection_manager.broadcast_staff(OrderCreatedEvent(order=read))
    await connection_manager.broadcast_table(table.code, OrderCreatedEvent(order=read))
    return read


async def list_orders_for_table(db: AsyncSession, restaurant_id: str, table_code: str) -> list[OrderRead]:
    table = await get_active_table(db, table_code.upper())
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.addons))
        .where(Order.restaurant_id == restaurant_id, Order.table_id == table.id)
        .order_by(Order.created_at.desc())
    )
    return [order_to_read(o, table.code) for o in result.scalars().all()]


async def list_all_orders(db: AsyncSession, restaurant_id: str) -> list[OrderRead]:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.addons), selectinload(Order.table))
        .where(Order.restaurant_id == restaurant_id)
        .order_by(Order.created_at.desc())
    )
    all_orders = list(result.scalars().all())

    billed_ids: set[str] = set()
    order_ids = [o.id for o in all_orders]
    if order_ids:
        billed_result = await db.execute(select(InvoiceOrder.order_id).where(InvoiceOrder.order_id.in_(order_ids)))
        billed_ids = set(billed_result.scalars().all())

    return [order_to_read(o, o.table.code, is_billed=o.id in billed_ids) for o in all_orders]


async def update_order_status(db: AsyncSession, restaurant_id: str, order_id: str, new_status: OrderStatusEnum) -> OrderRead:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.addons), selectinload(Order.table))
        .where(Order.id == order_id, Order.restaurant_id == restaurant_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")

    if order.status == OrderStatusEnum.cancelled:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "This order was already cancelled")

    if new_status == OrderStatusEnum.cancelled:
        # Cancelling doesn't fit the linear received→served flow — allowed
        # from any active status, but not once the food's already out.
        if order.status == OrderStatusEnum.served:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Can't cancel an order that's already been served")
        for oi in order.items:
            await inventory_service.restock_for_cancelled_order_line(db, oi.menu_item_id, oi.quantity)
    else:
        valid_statuses = {order.status, next_status(order.status)}
        if new_status not in valid_statuses:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid status transition")

    order.status = new_status
    await db.commit()

    # Re-select with eager loads instead of refresh(): the cancel path runs
    # extra queries mid-transaction, after which refresh() leaves the
    # items/addons collections expired — serializing them would then trigger
    # a lazy load outside the async context (MissingGreenlet).
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.addons), selectinload(Order.table))
        .where(Order.id == order_id)
    )
    order = result.scalar_one()

    read = order_to_read(order, order.table.code)
    await connection_manager.broadcast_staff(OrderUpdatedEvent(order=read))
    await connection_manager.broadcast_table(order.table.code, OrderUpdatedEvent(order=read))
    return read
