import re

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.menu import GlobalMenuItem, MenuCategory, MenuItem
from app.models.restaurant import Restaurant
from app.schemas.global_menu import GlobalMenuItemCreate, GlobalMenuItemUpdate


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "category"


async def list_global_items(db: AsyncSession, organization_id: str) -> list[GlobalMenuItem]:
    result = await db.execute(
        select(GlobalMenuItem)
        .where(GlobalMenuItem.organization_id == organization_id)
        .order_by(GlobalMenuItem.created_at.desc())
    )
    return list(result.scalars().all())


async def _get_global_item_or_404(db: AsyncSession, organization_id: str, item_id: str) -> GlobalMenuItem:
    item = await db.get(GlobalMenuItem, item_id)
    if not item or item.organization_id != organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Global menu item not found")
    return item


async def create_global_item(db: AsyncSession, organization_id: str, payload: GlobalMenuItemCreate) -> GlobalMenuItem:
    item = GlobalMenuItem(organization_id=organization_id, **payload.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    await push_global_item(db, item)
    return item


async def update_global_item(
    db: AsyncSession, organization_id: str, item_id: str, payload: GlobalMenuItemUpdate
) -> GlobalMenuItem:
    item = await _get_global_item_or_404(db, organization_id, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    await push_global_item(db, item)
    return item


async def _find_or_create_category(db: AsyncSession, restaurant_id: str, category_name: str) -> MenuCategory:
    result = await db.execute(
        select(MenuCategory).where(
            MenuCategory.restaurant_id == restaurant_id,
            func.lower(MenuCategory.name) == category_name.lower(),
        )
    )
    category = result.scalar_one_or_none()
    if category:
        return category
    category = MenuCategory(
        restaurant_id=restaurant_id, name=category_name, slug=_slugify(category_name), sort_order=0
    )
    db.add(category)
    await db.flush()
    return category


async def push_global_item(db: AsyncSession, item: GlobalMenuItem) -> int:
    """Pushes/updates the branch-level `MenuItem` row (tagged via
    `source_global_item_id`) in every active branch of the org. On the
    INITIAL per-branch copy, `base_price` is seeded from the template; on
    every re-push, only `name/description/dietary_tags/category_id` are
    synced — `base_price` and `is_available` are left alone so a branch's
    local price override ("Branch Menu Override") survives future HQ edits."""
    result = await db.execute(
        select(Restaurant).where(Restaurant.organization_id == item.organization_id, Restaurant.is_active.is_(True))
    )
    branches = result.scalars().all()

    touched = 0
    for branch in branches:
        category = await _find_or_create_category(db, branch.id, item.category_name)

        existing_result = await db.execute(
            select(MenuItem).where(MenuItem.restaurant_id == branch.id, MenuItem.source_global_item_id == item.id)
        )
        menu_item = existing_result.scalar_one_or_none()

        if menu_item:
            menu_item.name = item.name
            menu_item.description = item.description
            menu_item.dietary_tags = item.dietary_tags
            menu_item.category_id = category.id
        else:
            menu_item = MenuItem(
                restaurant_id=branch.id,
                category_id=category.id,
                source_global_item_id=item.id,
                name=item.name,
                description=item.description,
                base_price=item.base_price,
                dietary_tags=item.dietary_tags,
            )
            db.add(menu_item)
        touched += 1

    await db.commit()
    return touched
