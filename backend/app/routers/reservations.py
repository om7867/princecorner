from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_menu_managers
from app.core.tenant import get_current_restaurant_for_staff, get_current_restaurant_public
from app.db.session import get_db
from app.models.restaurant import Restaurant
from app.schemas.reservation import ReservationCreate, ReservationRead, ReservationStatusUpdate
from app.services import reservations as reservations_service

router = APIRouter(tags=["reservations"])


@router.post("/reservations", response_model=ReservationRead)
async def create_reservation(
    payload: ReservationCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_public),
) -> ReservationRead:
    return await reservations_service.create_reservation(db, restaurant.id, payload)


admin_router = APIRouter(
    prefix="/admin", tags=["admin-reservations"], dependencies=[Depends(require_menu_managers)]
)


@admin_router.get("/reservations", response_model=list[ReservationRead])
async def admin_list_reservations(
    db: AsyncSession = Depends(get_db), restaurant: Restaurant = Depends(get_current_restaurant_for_staff)
) -> list[ReservationRead]:
    return await reservations_service.list_reservations(db, restaurant.id)


@admin_router.post("/reservations", response_model=ReservationRead)
async def admin_create_reservation(
    payload: ReservationCreate,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
) -> ReservationRead:
    return await reservations_service.create_reservation(db, restaurant.id, payload)


@admin_router.delete("/reservations/{reservation_id}")
async def admin_delete_reservation(
    reservation_id: str,
    db: AsyncSession = Depends(get_db),
    restaurant: Restaurant = Depends(get_current_restaurant_for_staff),
):
    await reservations_service.delete_reservation(db, restaurant.id, reservation_id)
    return {"status": "deleted"}

