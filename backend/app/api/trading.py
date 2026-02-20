from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.trade_schema import TradeRequest, TransactionResponse
from app.services.trading_service import TradingService

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
