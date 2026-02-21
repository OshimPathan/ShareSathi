from typing import Annotated, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.trade_schema import TradeRequest, TransactionResponse
from app.services.trading_service import TradingService
from app.repositories.trade_repo import TradeRepository

router = APIRouter()

@router.post("/buy", response_model=TransactionResponse)
async def buy_stock(
    trade_request: TradeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    trading_service = TradingService(db)
    return await trading_service.execute_buy(
        user_id=current_user.id, 
        symbol=trade_request.symbol.upper(), 
        quantity=trade_request.quantity
    )

@router.post("/sell", response_model=TransactionResponse)
async def sell_stock(
    trade_request: TradeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    trading_service = TradingService(db)
    return await trading_service.execute_sell(
        user_id=current_user.id, 
        symbol=trade_request.symbol.upper(), 
        quantity=trade_request.quantity
    )

@router.get("/history", response_model=List[TransactionResponse])
async def get_transaction_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=50, le=200, ge=1),
    offset: int = Query(default=0, ge=0)
):
    """Get the current user's trade transaction history."""
    trade_repo = TradeRepository(db)
    transactions = await trade_repo.get_user_transactions(
        user_id=current_user.id, limit=limit, offset=offset
    )
    return transactions
