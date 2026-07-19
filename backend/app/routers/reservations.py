from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_menu_managers
from app.core.tenant import get_current_restaurant
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.schemas.reservation import ReservationCreate, ReservationRead, ReservationStatusUpdate
from app.services import reservations as reservations_service

router = APIRouter(tags=["reservations"])


@router.post("/reservations", response_model=ReservationRead)
async def create_reservation(
    payload: ReservationCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> ReservationRead:
    return await reservations_service.create_reservation(db, restaurant.id, payload)


admin_router = APIRouter(
    prefix="/admin", tags=["admin-reservations"], dependencies=[Depends(require_menu_managers)]
)


@admin_router.get("/reservations", response_model=list[ReservationRead])
async def admin_list_reservations(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant)
) -> list[ReservationRead]:
    return await reservations_service.list_reservations(db, restaurant.id)


@admin_router.patch("/reservations/{reservation_id}", response_model=ReservationRead)
async def admin_update_reservation(
    reservation_id: str,
    payload: ReservationStatusUpdate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant),
) -> ReservationRead:
    return await reservations_service.update_reservation_status(db, restaurant.id, reservation_id, payload.status)
