from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_menu_managers
from app.core.tenant import get_current_restaurant
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.schemas.table import TableBulkCreate, TableCreate, TableRead, TableUpdate
from app.services import tables as tables_service

router = APIRouter(tags=["tables"])


@router.get("/tables", response_model=list[TableRead])
async def public_list_tables(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant)
) -> list[TableRead]:
    """Public-safe subset used by the guest order page to validate ?table=."""
    tables = await tables_service.list_tables(db, restaurant.id, active_only=True)
    return [TableRead.model_validate(t) for t in tables]


admin_router = APIRouter(prefix="/admin", tags=["admin-tables"], dependencies=[Depends(require_menu_managers)])


@admin_router.get("/tables", response_model=list[TableRead])
async def admin_list_tables(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant)
) -> list[TableRead]:
    tables = await tables_service.list_tables(db, restaurant.id)
    return [TableRead.model_validate(t) for t in tables]


@admin_router.post("/tables", response_model=TableRead)
async def admin_create_table(
    payload: TableCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> TableRead:
    table = await tables_service.create_table(db, restaurant.id, payload.code.upper())
    return TableRead.model_validate(table)


@admin_router.post("/tables/bulk", response_model=list[TableRead])
async def admin_bulk_create_tables(
    payload: TableBulkCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> list[TableRead]:
    tables = await tables_service.bulk_create_tables(db, restaurant.id, payload.count)
    return [TableRead.model_validate(t) for t in tables]


@admin_router.patch("/tables/{table_id}", response_model=TableRead)
async def admin_update_table(
    table_id: str,
    payload: TableUpdate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> TableRead:
    table = await tables_service.update_table(db, restaurant.id, table_id, payload.is_active)
    return TableRead.model_validate(table)


@admin_router.delete("/tables/{table_id}")
async def admin_delete_table(
    table_id: str, db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant)
) -> dict:
    await tables_service.delete_table(db, restaurant.id, table_id)
    return {"ok": True}
