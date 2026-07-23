from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.menu import MenuCategory, MenuItem, MenuItemAddon, MenuItemVariant
from app.models.order import OrderItem
from app.realtime.manager import connection_manager
from app.schemas.menu import CategoryWrite, MenuItemCreate, MenuItemUpdate


async def list_categories(db: AsyncSession, restaurant_id: str) -> list[MenuCategory]:
    result = await db.execute(
        select(MenuCategory).where(MenuCategory.restaurant_id == restaurant_id).order_by(MenuCategory.sort_order)
    )
    return list(result.scalars().all())


async def create_category(db: AsyncSession, restaurant_id: str, payload: CategoryWrite) -> MenuCategory:
    category = MenuCategory(restaurant_id=restaurant_id, **payload.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


def _menu_item_query(restaurant_id: str, available_only: bool):
    stmt = (
        select(MenuItem)
        .options(selectinload(MenuItem.variants), selectinload(MenuItem.addons))
        .where(MenuItem.restaurant_id == restaurant_id, MenuItem.is_active.is_(True))
        .order_by(MenuItem.sort_order)
    )
    if available_only:
        stmt = stmt.where(MenuItem.is_available.is_(True))
    return stmt


async def list_menu_items(db: AsyncSession, restaurant_id: str, available_only: bool) -> list[MenuItem]:
    result = await db.execute(_menu_item_query(restaurant_id, available_only))
    return list(result.scalars().all())


async def create_menu_item(db: AsyncSession, restaurant_id: str, payload: MenuItemCreate) -> MenuItem:
    item = MenuItem(restaurant_id=restaurant_id, **payload.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item, attribute_names=["variants", "addons"])
    return item


async def get_menu_item_or_404(db: AsyncSession, restaurant_id: str, item_id: str) -> MenuItem:
    result = await db.execute(
        select(MenuItem)
        .options(selectinload(MenuItem.variants), selectinload(MenuItem.addons))
        .where(MenuItem.id == item_id, MenuItem.restaurant_id == restaurant_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Menu item not found")
    return item


_BRANCH_OVERRIDABLE_FIELDS = {"base_price", "is_available", "is_active", "sort_order"}


async def update_menu_item(db: AsyncSession, restaurant_id: str, item_id: str, payload: MenuItemUpdate) -> MenuItem:
    item = await get_menu_item_or_404(db, restaurant_id, item_id)
    updates = payload.model_dump(exclude_unset=True)
    if item.source_global_item_id is not None and not set(updates).issubset(_BRANCH_OVERRIDABLE_FIELDS):
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "This item is managed by chain HQ — only price and availability can be changed here",
        )
    for field, value in updates.items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item, attribute_names=["variants", "addons"])
    await connection_manager.broadcast_menu_update(item.id)
    return item


async def delete_menu_item(db: AsyncSession, restaurant_id: str, item_id: str) -> None:
    item = await get_menu_item_or_404(db, restaurant_id, item_id)
    has_orders = (
        await db.execute(select(OrderItem.id).where(OrderItem.menu_item_id == item.id).limit(1))
    ).scalar_one_or_none()
    if has_orders:
        item.is_active = False
        await db.commit()
    else:
        await db.delete(item)
        await db.commit()
    await connection_manager.broadcast_menu_update(item_id)


async def add_variant(db: AsyncSession, restaurant_id: str, item_id: str, payload) -> MenuItemVariant:
    await get_menu_item_or_404(db, restaurant_id, item_id)
    variant = MenuItemVariant(menu_item_id=item_id, **payload.model_dump())
    db.add(variant)
    await db.commit()
    await db.refresh(variant)
    await connection_manager.broadcast_menu_update(item_id)
    return variant


async def update_variant(db: AsyncSession, restaurant_id: str, item_id: str, variant_id: str, payload) -> MenuItemVariant:
    await get_menu_item_or_404(db, restaurant_id, item_id)
    variant = await db.get(MenuItemVariant, variant_id)
    if not variant or variant.menu_item_id != item_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Variant not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(variant, field, value)
    await db.commit()
    await db.refresh(variant)
    await connection_manager.broadcast_menu_update(item_id)
    return variant


async def delete_variant(db: AsyncSession, restaurant_id: str, item_id: str, variant_id: str) -> None:
    variant = await db.get(MenuItemVariant, variant_id)
    if not variant or variant.menu_item_id != item_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Variant not found")
    await db.delete(variant)
    await db.commit()
    await connection_manager.broadcast_menu_update(item_id)


async def add_addon(db: AsyncSession, restaurant_id: str, item_id: str, payload) -> MenuItemAddon:
    await get_menu_item_or_404(db, restaurant_id, item_id)
    addon = MenuItemAddon(menu_item_id=item_id, **payload.model_dump())
    db.add(addon)
    await db.commit()
    await db.refresh(addon)
    await connection_manager.broadcast_menu_update(item_id)
    return addon


async def update_addon(db: AsyncSession, restaurant_id: str, item_id: str, addon_id: str, payload) -> MenuItemAddon:
    await get_menu_item_or_404(db, restaurant_id, item_id)
    addon = await db.get(MenuItemAddon, addon_id)
    if not addon or addon.menu_item_id != item_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Addon not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(addon, field, value)
    await db.commit()
    await db.refresh(addon)
    await connection_manager.broadcast_menu_update(item_id)
    return addon


async def delete_addon(db: AsyncSession, restaurant_id: str, item_id: str, addon_id: str) -> None:
    addon = await db.get(MenuItemAddon, addon_id)
    if not addon or addon.menu_item_id != item_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Addon not found")
    await db.delete(addon)
    await db.commit()
    await connection_manager.broadcast_menu_update(item_id)
