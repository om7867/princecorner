from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tenant import get_current_restaurant
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.schemas.menu import CategoryRead, MenuItemRead
from app.services.menu import list_categories, list_menu_items

router = APIRouter(tags=["menu"])


@router.get("/menu", response_model=list[MenuItemRead])
async def get_menu(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant)
) -> list[MenuItemRead]:
    items = await list_menu_items(db, restaurant.id, available_only=True)
    return [MenuItemRead.model_validate(i) for i in items]


@router.get("/menu/categories", response_model=list[CategoryRead])
async def get_categories(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant)
) -> list[CategoryRead]:
    categories = await list_categories(db, restaurant.id)
    return [CategoryRead.model_validate(c) for c in categories]
