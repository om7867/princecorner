from typing import Literal

from pydantic import BaseModel

from app.schemas.billing import InvoiceRead
from app.schemas.order import OrderRead
from app.schemas.reservation import ReservationRead


class OrderCreatedEvent(BaseModel):
    type: Literal["order.created"] = "order.created"
    order: OrderRead


class OrderUpdatedEvent(BaseModel):
    type: Literal["order.updated"] = "order.updated"
    order: OrderRead


class MenuUpdatedEvent(BaseModel):
    type: Literal["menu.updated"] = "menu.updated"
    item_id: str


class SiteUpdatedEvent(BaseModel):
    type: Literal["site.updated"] = "site.updated"


class ReservationCreatedEvent(BaseModel):
    type: Literal["reservation.created"] = "reservation.created"
    reservation: ReservationRead


class InvoiceCreatedEvent(BaseModel):
    type: Literal["invoice.created"] = "invoice.created"
    invoice: InvoiceRead


class InvoiceUpdatedEvent(BaseModel):
    type: Literal["invoice.updated"] = "invoice.updated"
    invoice: InvoiceRead


LiveEvent = (
    OrderCreatedEvent
    | OrderUpdatedEvent
    | MenuUpdatedEvent
    | SiteUpdatedEvent
    | ReservationCreatedEvent
    | InvoiceCreatedEvent
    | InvoiceUpdatedEvent
)
