from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_super_admin
from app.core.tenant import get_current_organization_id
from app.db.session import get_db
from app.schemas.global_menu import GlobalMenuItemCreate, GlobalMenuItemRead, GlobalMenuItemUpdate
from app.services import global_menu as global_menu_service

router = APIRouter(prefix="/admin/org/menu", tags=["global-menu"], dependencies=[Depends(require_super_admin)])


@router.get("", response_model=list[GlobalMenuItemRead])
async def list_global_menu(
    organization_id: str = Depends(get_current_organization_id), db: AsyncSession = Depends(get_db)
) -> list[GlobalMenuItemRead]:
    items = await global_menu_service.list_global_items(db, organization_id)
    return [GlobalMenuItemRead.model_validate(i) for i in items]


@router.post("", response_model=GlobalMenuItemRead)
async def create_global_menu_item(
    payload: GlobalMenuItemCreate,
    organization_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
) -> GlobalMenuItemRead:
    item = await global_menu_service.create_global_item(db, organization_id, payload)
    return GlobalMenuItemRead.model_validate(item)


@router.patch("/{item_id}", response_model=GlobalMenuItemRead)
async def update_global_menu_item(
    item_id: str,
    payload: GlobalMenuItemUpdate,
    organization_id: str = Depends(get_current_organization_id),
    db: AsyncSession = Depends(get_db),
) -> GlobalMenuItemRead:
    item = await global_menu_service.update_global_item(db, organization_id, item_id, payload)
    return GlobalMenuItemRead.model_validate(item)
