from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.watchlist_schema import WatchlistItemCreate, WatchlistItemUpdate
from app.services.watchlist_service import WatchlistService

router = APIRouter()

@router.get("")
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = WatchlistService(db)
    return await service.get_user_watchlist(current_user.id)

@router.post("")
async def add_watchlist_item(
    item: WatchlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = WatchlistService(db)
    return await service.add_item(current_user.id, item)

@router.put("/{symbol}")
async def update_watchlist_item(
    symbol: str,
    data: WatchlistItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = WatchlistService(db)
    try:
        return await service.update_item(current_user.id, symbol, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{symbol}")
async def remove_watchlist_item(
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = WatchlistService(db)
    success = await service.remove_item(current_user.id, symbol)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in watchlist")
    return {"message": "Success"}
