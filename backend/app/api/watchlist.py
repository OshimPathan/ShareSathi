from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.services.watchlist_service import WatchlistService

router = APIRouter()

@router.get("")
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = WatchlistService(db)
    return await service.get_user_watchlist(current_user.id)

@router.post("/{symbol}")
async def add_to_watchlist(
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = WatchlistService(db)
    return await service.add_symbol(current_user.id, symbol.upper())
