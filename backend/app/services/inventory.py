from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.inventory import Ingredient, InventoryTransferRequest, MenuItemIngredient, Supplier, TransferStatusEnum
from app.models.restaurant import Restaurant
from app.schemas.inventory import (
    IngredientCreate,
    IngredientUpdate,
    RecipeLineWrite,
    SupplierWrite,
    TransferRequestCreate,
    TransferRequestDecision,
)

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


# ── Inter-branch inventory transfers ──────────────────────────────────────


async def list_sibling_branches(
    db: AsyncSession, organization_id: str, exclude_restaurant_id: str
) -> list[Restaurant]:
    result = await db.execute(
        select(Restaurant)
        .where(
            Restaurant.organization_id == organization_id,
            Restaurant.is_active.is_(True),
            Restaurant.id != exclude_restaurant_id,
        )
        .order_by(Restaurant.name)
    )
    return list(result.scalars().all())


async def create_transfer_request(
    db: AsyncSession,
    *,
    organization_id: str,
    to_restaurant_id: str,
    from_restaurant_id: str,
    requested_by_user_id: str,
    payload: TransferRequestCreate,
) -> InventoryTransferRequest:
    source = await db.get(Restaurant, from_restaurant_id)
    if not source or source.organization_id != organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Source branch not found")

    transfer_request = InventoryTransferRequest(
        organization_id=organization_id,
        from_restaurant_id=from_restaurant_id,
        to_restaurant_id=to_restaurant_id,
        ingredient_name=payload.ingredient_name,
        unit=payload.unit,
        quantity=payload.quantity,
        status=TransferStatusEnum.pending,
        requested_by_user_id=requested_by_user_id,
        note=payload.note,
    )
    db.add(transfer_request)
    await db.commit()
    await db.refresh(transfer_request)
    return transfer_request


async def list_transfer_requests_for_branch(db: AsyncSession, restaurant_id: str) -> list[InventoryTransferRequest]:
    result = await db.execute(
        select(InventoryTransferRequest)
        .where(
            (InventoryTransferRequest.from_restaurant_id == restaurant_id)
            | (InventoryTransferRequest.to_restaurant_id == restaurant_id)
        )
        .order_by(InventoryTransferRequest.created_at.desc())
    )
    return list(result.scalars().all())


async def list_pending_transfer_requests_for_org(
    db: AsyncSession, organization_id: str
) -> list[tuple[InventoryTransferRequest, str, str]]:
    from_restaurant = Restaurant.__table__.alias("from_restaurant")
    to_restaurant = Restaurant.__table__.alias("to_restaurant")

    result = await db.execute(
        select(InventoryTransferRequest, from_restaurant.c.name, to_restaurant.c.name)
        .join(from_restaurant, InventoryTransferRequest.from_restaurant_id == from_restaurant.c.id)
        .join(to_restaurant, InventoryTransferRequest.to_restaurant_id == to_restaurant.c.id)
        .where(
            InventoryTransferRequest.organization_id == organization_id,
            InventoryTransferRequest.status == TransferStatusEnum.pending,
        )
        .order_by(InventoryTransferRequest.created_at.desc())
    )
    return [(row[0], row[1], row[2]) for row in result.all()]


async def decide_transfer_request(
    db: AsyncSession, *, organization_id: str, request_id: str, decision: TransferRequestDecision
) -> InventoryTransferRequest:
    transfer_request = await db.get(InventoryTransferRequest, request_id)
    if not transfer_request or transfer_request.organization_id != organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Transfer request not found")
    if transfer_request.status != TransferStatusEnum.pending:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Transfer request is no longer pending")

    if decision.status == "rejected":
        transfer_request.status = TransferStatusEnum.rejected
        transfer_request.resolved_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(transfer_request)
        return transfer_request

    source_result = await db.execute(
        select(Ingredient).where(
            Ingredient.restaurant_id == transfer_request.from_restaurant_id,
            func.lower(Ingredient.name) == transfer_request.ingredient_name.lower(),
        )
    )
    source_ingredient = source_result.scalar_one_or_none()
    if not source_ingredient:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Source branch doesn't have this ingredient")
    if source_ingredient.stock_quantity < transfer_request.quantity:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Insufficient stock at source branch")
    source_ingredient.stock_quantity = source_ingredient.stock_quantity - transfer_request.quantity

    dest_result = await db.execute(
        select(Ingredient).where(
            Ingredient.restaurant_id == transfer_request.to_restaurant_id,
            func.lower(Ingredient.name) == transfer_request.ingredient_name.lower(),
        )
    )
    dest_ingredient = dest_result.scalar_one_or_none()
    if not dest_ingredient:
        dest_ingredient = Ingredient(
            restaurant_id=transfer_request.to_restaurant_id,
            name=transfer_request.ingredient_name,
            unit=transfer_request.unit,
            stock_quantity=Decimal("0"),
            low_stock_threshold=Decimal("0"),
        )
        db.add(dest_ingredient)
    dest_ingredient.stock_quantity = dest_ingredient.stock_quantity + transfer_request.quantity

    transfer_request.status = TransferStatusEnum.completed
    transfer_request.resolved_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(transfer_request)
    return transfer_request
