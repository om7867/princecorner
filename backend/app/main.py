from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import (
    admin_menu,
    analytics,
    auth,
    billing,
    inventory,
    menu,
    orders,
    promotions,
    realtime,
    reservations,
    settings,
    tables,
    ws,
)

settings_ = get_settings()

app = FastAPI(title="Restaurant Ordering Platform API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings_.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(settings.router)
app.include_router(menu.router)
app.include_router(admin_menu.router)
app.include_router(tables.router)
app.include_router(tables.admin_router)
app.include_router(orders.router)
app.include_router(orders.admin_router)
app.include_router(reservations.router)
app.include_router(reservations.admin_router)
app.include_router(realtime.router)
app.include_router(ws.router)
app.include_router(billing.router)
app.include_router(billing.admin_router)
app.include_router(billing.refund_router)
app.include_router(promotions.router)
app.include_router(inventory.router)
app.include_router(analytics.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
