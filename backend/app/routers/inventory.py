from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_menu_managers, require_super_admin
from app.core.tenant import get_current_organization_id, get_current_restaurant_for_staff
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.inventory import (
    IngredientCreate,
    IngredientRead,
    IngredientUpdate,
    RecipeLineRead,
    RecipeLineWrite,
    SiblingBranchRead,
    SupplierRead,
    SupplierWrite,
    TransferRequestCreate,
    TransferRequestDecision,
    TransferRequestRead,
    TransferRequestReadWithNames,
)
from app.services import inventory as inventory_service

router = APIRouter(prefix="/admin", tags=["admin-inventory"], dependencies=[Depends(require_menu_managers)])


def _ingredient_to_read(ingredient) -> IngredientRead:
    data = IngredientRead.model_validate(ingredient)
    data.is_low_stock = ingredient.stock_quantity <= ingredient.low_stock_threshold
    return data


@router.get("/suppliers", response_model=list[SupplierRead])
async def list_suppliers(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_for_staff)
) -> list[SupplierRead]:
    suppliers = await inventory_service.list_suppliers(db, restaurant.id)
    return [SupplierRead.model_validate(s) for s in suppliers]


@router.post("/suppliers", response_model=SupplierRead)
async def create_supplier(
    payload: SupplierWrite,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
) -> SupplierRead:
    supplier = await inventory_service.create_supplier(db, restaurant.id, payload)
    return SupplierRead.model_validate(supplier)


@router.get("/ingredients", response_model=list[IngredientRead])
async def list_ingredients(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_for_staff)
) -> list[IngredientRead]:
    ingredients = await inventory_service.list_ingredients(db, restaurant.id)
    return [_ingredient_to_read(i) for i in ingredients]


@router.post("/ingredients", response_model=IngredientRead)
async def create_ingredient(
    payload: IngredientCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
) -> IngredientRead:
    ingredient = await inventory_service.create_ingredient(db, restaurant.id, payload)
    return _ingredient_to_read(ingredient)


@router.patch("/ingredients/{ingredient_id}", response_model=IngredientRead)
async def update_ingredient(
    ingredient_id: str,
    payload: IngredientUpdate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
) -> IngredientRead:
    ingredient = await inventory_service.update_ingredient(db, restaurant.id, ingredient_id, payload)
    return _ingredient_to_read(ingredient)


@router.delete("/ingredients/{ingredient_id}")
async def delete_ingredient(
    ingredient_id: str, db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_for_staff)
) -> dict:
    await inventory_service.delete_ingredient(db, restaurant.id, ingredient_id)
    return {"ok": True}


@router.get("/menu/items/{item_id}/recipe", response_model=list[RecipeLineRead])
async def get_recipe(item_id: str, db: AsyncSession = Depends(get_db)) -> list[RecipeLineRead]:
    lines = await inventory_service.list_recipe(db, item_id)
    return [
        RecipeLineRead(
            id=line.id,
            ingredient_id=line.ingredient_id,
            ingredient_name=line.ingredient.name,
            unit=line.ingredient.unit,
            quantity_per_serving=line.quantity_per_serving,
        )
        for line in lines
    ]


@router.put("/menu/items/{item_id}/recipe", response_model=RecipeLineRead)
async def set_recipe_line(
    item_id: str, payload: RecipeLineWrite, db: AsyncSession = Depends(get_db)
) -> RecipeLineRead:
    line = await inventory_service.set_recipe_line(db, item_id, payload)
    return RecipeLineRead(
        id=line.id,
        ingredient_id=line.ingredient_id,
        ingredient_name=line.ingredient.name,
        unit=line.ingredient.unit,
        quantity_per_serving=line.quantity_per_serving,
    )


@router.delete("/menu/items/{item_id}/recipe/{ingredient_id}")
async def remove_recipe_line(item_id: str, ingredient_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    await inventory_service.remove_recipe_line(db, item_id, ingredient_id)
    return {"ok": True}


# ── Inter-branch inventory transfers ──────────────────────────────────────


@router.get("/inventory/sibling-branches", response_model=list[SiblingBranchRead])
async def list_sibling_branches(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_for_staff)
) -> list[SiblingBranchRead]:
    branches = await inventory_service.list_sibling_branches(db, restaurant.organization_id, restaurant.id)
    return [SiblingBranchRead.model_validate(b) for b in branches]


@router.post("/inventory/transfer-requests", response_model=TransferRequestRead)
async def create_transfer_request(
    payload: TransferRequestCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
    current_user: User = Depends(get_current_user),
) -> TransferRequestRead:
    transfer_request = await inventory_service.create_transfer_request(
        db,
        organization_id=restaurant.organization_id,
        to_restaurant_id=restaurant.id,
        from_restaurant_id=payload.from_restaurant_id,
        requested_by_user_id=current_user.id,
        payload=payload,
    )
    return TransferRequestRead.model_validate(transfer_request)


@router.get("/inventory/transfer-requests", response_model=list[TransferRequestRead])
async def list_transfer_requests(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_for_staff)
) -> list[TransferRequestRead]:
    requests = await inventory_service.list_transfer_requests_for_branch(db, restaurant.id)
    return [TransferRequestRead.model_validate(r) for r in requests]


@router.get(
    "/org/inventory/transfer-requests",
    response_model=list[TransferRequestReadWithNames],
    dependencies=[Depends(require_super_admin)],
)
async def list_org_transfer_requests(
    db: AsyncSession = Depends(get_db), organization_id: str = Depends(get_current_organization_id)
) -> list[TransferRequestReadWithNames]:
    rows = await inventory_service.list_pending_transfer_requests_for_org(db, organization_id)
    return [
        TransferRequestReadWithNames(
            **TransferRequestRead.model_validate(request).model_dump(),
            from_restaurant_name=from_name,
            to_restaurant_name=to_name,
        )
        for request, from_name, to_name in rows
    ]


@router.patch(
    "/org/inventory/transfer-requests/{request_id}",
    response_model=TransferRequestRead,
    dependencies=[Depends(require_super_admin)],
)
async def decide_transfer_request(
    request_id: str,
    payload: TransferRequestDecision,
    db: AsyncSession = Depends(get_db),
    organization_id: str = Depends(get_current_organization_id),
) -> TransferRequestRead:
    transfer_request = await inventory_service.decide_transfer_request(
        db, organization_id=organization_id, request_id=request_id, decision=payload
    )
    return TransferRequestRead.model_validate(transfer_request)
