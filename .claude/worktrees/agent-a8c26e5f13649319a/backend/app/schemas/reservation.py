from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field

from app.models.reservation import ReservationStatusEnum


class ReservationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    phone: str = Field(min_length=7, max_length=40)
    party_size: int = Field(ge=1, le=20)
    date: date
    time: time
    note: str = ""


class ReservationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    reference_code: str
    name: str
    phone: str
    party_size: int
    date: date
    time: time
    note: str
    status: ReservationStatusEnum
    created_at: datetime


class ReservationStatusUpdate(BaseModel):
    status: ReservationStatusEnum
