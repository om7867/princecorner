import random
import string
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reservation import Reservation, ReservationStatusEnum
from app.realtime.events import ReservationCreatedEvent
from app.realtime.manager import connection_manager
from app.schemas.reservation import ReservationCreate


def _reference_code() -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"RES-{suffix}"


async def create_reservation(db: AsyncSession, restaurant_id: str, payload: ReservationCreate) -> Reservation:
    if payload.date < date.today():
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Reservation date cannot be in the past")

    reservation = Reservation(
        restaurant_id=restaurant_id,
        reference_code=_reference_code(),
        name=payload.name.strip(),
        phone=payload.phone.strip(),
        party_size=payload.party_size,
        date=payload.date,
        time=payload.time,
        note=payload.note.strip()[:1000],
        status=ReservationStatusEnum.pending,
    )
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)

    await connection_manager.broadcast_staff(ReservationCreatedEvent(reservation=reservation))
    return reservation


async def list_reservations(db: AsyncSession, restaurant_id: str) -> list[Reservation]:
    result = await db.execute(
        select(Reservation).where(Reservation.restaurant_id == restaurant_id).order_by(Reservation.date, Reservation.time)
    )
    return list(result.scalars().all())


async def update_reservation_status(
    db: AsyncSession, restaurant_id: str, reservation_id: str, new_status: ReservationStatusEnum
) -> Reservation:
    reservation = await db.get(Reservation, reservation_id)
    if not reservation or reservation.restaurant_id != restaurant_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reservation not found")
    reservation.status = new_status
    await db.commit()
    await db.refresh(reservation)
    return reservation


async def delete_reservation(db: AsyncSession, restaurant_id: str, reservation_id: str) -> None:
    reservation = await db.get(Reservation, reservation_id)
    if not reservation or reservation.restaurant_id != restaurant_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reservation not found")
    await db.delete(reservation)
    await db.commit()

