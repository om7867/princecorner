from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_menu_managers
from app.core.tenant import get_current_restaurant
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.schemas.menu import (
    AddonRead,
    AddonWrite,
    CategoryRead,
    CategoryWrite,
    MenuItemCreate,
    MenuItemRead,
    MenuItemUpdate,
    VariantRead,
    VariantWrite,
)
from app.services import menu as menu_service

router = APIRouter(prefix="/admin", tags=["admin-menu"], dependencies=[Depends(require_menu_managers)])


@router.get("/menu", response_model=list[MenuItemRead])
async def admin_list_menu(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant)
) -> list[MenuItemRead]:
    items = await menu_service.list_menu_items(db, restaurant.id, available_only=False)
    return [MenuItemRead.model_validate(i) for i in items]


@router.post("/menu/categories", response_model=CategoryRead)
async def create_category(
    payload: CategoryWrite,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> CategoryRead:
    category = await menu_service.create_category(db, restaurant.id, payload)
    return CategoryRead.model_validate(category)


@router.post("/menu/items", response_model=MenuItemRead)
async def create_item(
    payload: MenuItemCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> MenuItemRead:
    item = await menu_service.create_menu_item(db, restaurant.id, payload)
    return MenuItemRead.model_validate(item)


@router.patch("/menu/items/{item_id}", response_model=MenuItemRead)
async def patch_item(
    item_id: str,
    payload: MenuItemUpdate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> MenuItemRead:
    item = await menu_service.update_menu_item(db, restaurant.id, item_id, payload)
    return MenuItemRead.model_validate(item)


@router.delete("/menu/items/{item_id}")
async def remove_item(
    item_id: str, db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant)
) -> dict:
    await menu_service.delete_menu_item(db, restaurant.id, item_id)
    return {"ok": True}


@router.post("/menu/items/{item_id}/variants", response_model=VariantRead)
async def create_variant(
    item_id: str,
    payload: VariantWrite,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> VariantRead:
    variant = await menu_service.add_variant(db, restaurant.id, item_id, payload)
    return VariantRead.model_validate(variant)


@router.patch("/menu/items/{item_id}/variants/{variant_id}", response_model=VariantRead)
async def patch_variant(
    item_id: str,
    variant_id: str,
    payload: VariantWrite,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> VariantRead:
    variant = await menu_service.update_variant(db, restaurant.id, item_id, variant_id, payload)
    return VariantRead.model_validate(variant)


@router.delete("/menu/items/{item_id}/variants/{variant_id}")
async def remove_variant(
    item_id: str,
    variant_id: str,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> dict:
    await menu_service.delete_variant(db, restaurant.id, item_id, variant_id)
    return {"ok": True}


@router.post("/menu/items/{item_id}/addons", response_model=AddonRead)
async def create_addon(
    item_id: str,
    payload: AddonWrite,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> AddonRead:
    addon = await menu_service.add_addon(db, restaurant.id, item_id, payload)
    return AddonRead.model_validate(addon)


@router.patch("/menu/items/{item_id}/addons/{addon_id}", response_model=AddonRead)
async def patch_addon(
    item_id: str,
    addon_id: str,
    payload: AddonWrite,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> AddonRead:
    addon = await menu_service.update_addon(db, restaurant.id, item_id, addon_id, payload)
    return AddonRead.model_validate(addon)


@router.delete("/menu/items/{item_id}/addons/{addon_id}")
async def remove_addon(
    item_id: str,
    addon_id: str,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> dict:
    await menu_service.delete_addon(db, restaurant.id, item_id, addon_id)
    return {"ok": True}
