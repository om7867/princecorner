from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tenant import get_current_restaurant
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.models.table import RestaurantTable
from app.realtime.manager import connection_manager
from app.realtime.tickets import ticket_store

router = APIRouter(tags=["ws"])


@router.websocket("/ws/orders")
async def orders_socket(
    websocket: WebSocket,
    ticket: str | None = None,
    table: str | None = None,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> None:
    if table:
        code = table.upper()
        result = await db.execute(
            select(RestaurantTable).where(
                RestaurantTable.restaurant_id == restaurant.id,
                RestaurantTable.code == code,
                RestaurantTable.is_active.is_(True),
            )
        )
        if not result.scalar_one_or_none():
            await websocket.close(code=4404)
            return
        await connection_manager.connect_guest(websocket, code)
    else:
        if not ticket or not ticket_store.consume(ticket):
            await websocket.close(code=4401)
            return
        await connection_manager.connect_staff(websocket)

    try:
        while True:
            # Guests/staff never need to send data over this channel today;
            # we just keep the connection open until the client disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        connection_manager.disconnect(websocket)
