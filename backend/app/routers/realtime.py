from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.user import User
from app.realtime.tickets import ticket_store

router = APIRouter(prefix="/realtime", tags=["realtime"])


@router.post("/ticket")
async def mint_ticket(user: User = Depends(get_current_user)) -> dict:
    return {"ticket": ticket_store.mint()}
