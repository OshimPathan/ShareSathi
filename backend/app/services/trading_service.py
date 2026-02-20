import logging
from typing import Dict, Any
from decimal import Decimal
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction
from app.models.portfolio import Portfolio
from app.repositories.user_repo import UserRepository
from app.repositories.portfolio_repo import PortfolioRepository
from app.repositories.trade_repo import TradeRepository
from app.services.nepse_service import NepseService

logger = logging.getLogger(__name__)

class TradingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.portfolio_repo = PortfolioRepository(db)
        self.trade_repo = TradeRepository(db)

    async def _get_current_price(self, symbol: str) -> Decimal:
        market_data = await NepseService.get_live_market()
        if market_data.get('is_stale', False) and not market_data.get('live_market'):
            raise HTTPException(status_code=503, detail="Market data unavailable")
            
        for stock in market_data.get("live_market", []):
            if stock.get("symbol") == symbol:
                return Decimal(str(stock.get("lastTradedPrice", 0)))
                
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found in live market")

    async def execute_buy(self, user_id: int, symbol: str, quantity: int) -> Transaction:
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

        price = await self._get_current_price(symbol)
        total_cost = price * quantity

        wallet = await self.user_repo.get_wallet_for_update(user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")

        if wallet.balance < total_cost:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        portfolio = await self.portfolio_repo.get_portfolio_item_for_update(user_id, symbol)

        if portfolio:
            total_value = (portfolio.quantity * portfolio.average_buy_price) + total_cost
            new_quantity = portfolio.quantity + quantity
            portfolio.quantity = new_quantity
            portfolio.average_buy_price = total_value / new_quantity
        else:
            portfolio = Portfolio(
                user_id=user_id,
                symbol=symbol,
                quantity=quantity,
                average_buy_price=price
            )
            self.portfolio_repo.create(portfolio)

        wallet.balance -= total_cost

        transaction = Transaction(
            user_id=user_id,
            symbol=symbol,
            transaction_type="BUY",
            quantity=quantity,
            price=price
        )
        self.trade_repo.record_transaction(transaction)

        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction

    async def execute_sell(self, user_id: int, symbol: str, quantity: int) -> Transaction:
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

        price = await self._get_current_price(symbol)
        total_revenue = price * quantity

        portfolio = await self.portfolio_repo.get_portfolio_item_for_update(user_id, symbol)
        if not portfolio or portfolio.quantity < quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock quantity")

        wallet = await self.user_repo.get_wallet_for_update(user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")

        portfolio.quantity -= quantity
        if portfolio.quantity == 0:
            portfolio.average_buy_price = Decimal("0.00")

        wallet.balance += total_revenue

        transaction = Transaction(
            user_id=user_id,
            symbol=symbol,
            transaction_type="SELL",
            quantity=quantity,
            price=price
        )
        self.trade_repo.record_transaction(transaction)

        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction
