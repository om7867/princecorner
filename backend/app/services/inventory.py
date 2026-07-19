from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.inventory import Ingredient, MenuItemIngredient, Supplier
from app.schemas.inventory import IngredientCreate, IngredientUpdate, RecipeLineWrite, SupplierWrite

# ── Suppliers ────────────────────────────────────────────────────────────


async def list_suppliers(db: AsyncSession, restaurant_id: str) -> list[Supplier]:
    result = await db.execute(select(Supplier).where(Supplier.restaurant_id == restaurant_id).order_by(Supplier.name))
    return list(result.scalars().all())


async def create_supplier(db: AsyncSession, restaurant_id: str, payload: SupplierWrite) -> Supplier:
    supplier = Supplier(restaurant_id=restaurant_id, **payload.model_dump())
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier


# ── Ingredients ──────────────────────────────────────────────────────────


async def list_ingredients(db: AsyncSession, restaurant_id: str) -> list[Ingredient]:
    result = await db.execute(
        select(Ingredient).where(Ingredient.restaurant_id == restaurant_id).order_by(Ingredient.name)
    )
    return list(result.scalars().all())


async def create_ingredient(db: AsyncSession, restaurant_id: str, payload: IngredientCreate) -> Ingredient:
    ingredient = Ingredient(restaurant_id=restaurant_id, **payload.model_dump())
    db.add(ingredient)
    await db.commit()
    await db.refresh(ingredient)
    return ingredient


async def update_ingredient(
    db: AsyncSession, restaurant_id: str, ingredient_id: str, payload: IngredientUpdate
) -> Ingredient:
    ingredient = await db.get(Ingredient, ingredient_id)
    if not ingredient or ingredient.restaurant_id != restaurant_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ingredient not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ingredient, field, value)
    await db.commit()
    await db.refresh(ingredient)
    return ingredient


async def delete_ingredient(db: AsyncSession, restaurant_id: str, ingredient_id: str) -> None:
    ingredient = await db.get(Ingredient, ingredient_id)
    if not ingredient or ingredient.restaurant_id != restaurant_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ingredient not found")
    await db.delete(ingredient)
    await db.commit()


async def low_stock_count(db: AsyncSession, restaurant_id: str) -> int:
    ingredients = await list_ingredients(db, restaurant_id)
    return sum(1 for i in ingredients if i.stock_quantity <= i.low_stock_threshold)


# ── Recipes (menu item <-> ingredient) ────────────────────────────────────


async def list_recipe(db: AsyncSession, menu_item_id: str) -> list[MenuItemIngredient]:
    result = await db.execute(
        select(MenuItemIngredient)
        .options(selectinload(MenuItemIngredient.ingredient))
        .where(MenuItemIngredient.menu_item_id == menu_item_id)
    )
    return list(result.scalars().all())


async def set_recipe_line(db: AsyncSession, menu_item_id: str, payload: RecipeLineWrite) -> MenuItemIngredient:
    result = await db.execute(
        select(MenuItemIngredient).where(
            MenuItemIngredient.menu_item_id == menu_item_id,
            MenuItemIngredient.ingredient_id == payload.ingredient_id,
        )
    )
    line = result.scalar_one_or_none()
    if line:
        line.quantity_per_serving = payload.quantity_per_serving
    else:
        line = MenuItemIngredient(menu_item_id=menu_item_id, **payload.model_dump())
        db.add(line)
    await db.commit()
    await db.refresh(line, attribute_names=["ingredient"])
    return line


async def remove_recipe_line(db: AsyncSession, menu_item_id: str, ingredient_id: str) -> None:
    result = await db.execute(
        select(MenuItemIngredient).where(
            MenuItemIngredient.menu_item_id == menu_item_id, MenuItemIngredient.ingredient_id == ingredient_id
        )
    )
    line = result.scalar_one_or_none()
    if line:
        await db.delete(line)
        await db.commit()


async def deduct_stock_for_order_line(db: AsyncSession, menu_item_id: str, quantity: int) -> None:
    """Called from order creation — decrements stock for every ingredient in
    this item's recipe. Deliberately does not block the order on insufficient
    stock (see backend/app/services/orders.py); negative stock is a valid,
    visible signal surfaced as a low-stock alert in Admin."""
    result = await db.execute(
        select(MenuItemIngredient).where(MenuItemIngredient.menu_item_id == menu_item_id)
    )
    for line in result.scalars().all():
        ingredient = await db.get(Ingredient, line.ingredient_id)
        if ingredient:
            ingredient.stock_quantity = ingredient.stock_quantity - (line.quantity_per_serving * Decimal(quantity))


async def restock_for_cancelled_order_line(db: AsyncSession, menu_item_id: str | None, quantity: int) -> None:
    """Reverses deduct_stock_for_order_line — called when an order is
    cancelled before the kitchen used the ingredients."""
    if not menu_item_id:
        return
    result = await db.execute(
        select(MenuItemIngredient).where(MenuItemIngredient.menu_item_id == menu_item_id)
    )
    for line in result.scalars().all():
        ingredient = await db.get(Ingredient, line.ingredient_id)
        if ingredient:
            ingredient.stock_quantity = ingredient.stock_quantity + (line.quantity_per_serving * Decimal(quantity))
