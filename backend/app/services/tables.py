from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order
from app.models.table import RestaurantTable


async def list_tables(db: AsyncSession, restaurant_id: str, active_only: bool = False) -> list[RestaurantTable]:
    stmt = select(RestaurantTable).where(RestaurantTable.restaurant_id == restaurant_id)
    if active_only:
        stmt = stmt.where(RestaurantTable.is_active.is_(True))
    stmt = stmt.order_by(RestaurantTable.code)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_table(db: AsyncSession, restaurant_id: str, code: str) -> RestaurantTable:
    existing = await db.execute(
        select(RestaurantTable).where(RestaurantTable.restaurant_id == restaurant_id, RestaurantTable.code == code)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status.HTTP_409_CONFLICT, "Table code already exists")
    table = RestaurantTable(restaurant_id=restaurant_id, code=code)
    db.add(table)
    await db.commit()
    await db.refresh(table)
    return table


async def bulk_create_tables(db: AsyncSession, restaurant_id: str, count: int) -> list[RestaurantTable]:
    if count < 1 or count > 200:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Count must be between 1 and 200")

    existing_codes = (
        await db.execute(select(RestaurantTable.code).where(RestaurantTable.restaurant_id == restaurant_id))
    ).scalars().all()
    max_n = 0
    for code in existing_codes:
        if code.upper().startswith("T") and code[1:].isdigit():
            max_n = max(max_n, int(code[1:]))

    created = []
    for i in range(1, count + 1):
        table = RestaurantTable(restaurant_id=restaurant_id, code=f"T{max_n + i}")
        db.add(table)
        created.append(table)
    await db.commit()
    for table in created:
        await db.refresh(table)
    return created


async def update_table(db: AsyncSession, restaurant_id: str, table_id: str, is_active: bool | None) -> RestaurantTable:
    table = await db.get(RestaurantTable, table_id)
    if not table or table.restaurant_id != restaurant_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Table not found")
    if is_active is not None:
        table.is_active = is_active
    await db.commit()
    await db.refresh(table)
    return table


async def delete_table(db: AsyncSession, restaurant_id: str, table_id: str) -> None:
    table = await db.get(RestaurantTable, table_id)
    if not table or table.restaurant_id != restaurant_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Table not found")
    order_count = (
        await db.execute(select(func.count()).select_from(Order).where(Order.table_id == table_id))
    ).scalar_one()
    if order_count > 0:
        raise HTTPException(status.HTTP_409_CONFLICT, "Table has order history; deactivate instead of deleting")
    await db.delete(table)
    await db.commit()
