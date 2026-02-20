from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.stock import Stock
from app.models.historical_price import HistoricalPrice

class StockRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_stock_by_symbol(self, symbol: str) -> Optional[Stock]:
        result = await self.db.execute(select(Stock).where(Stock.symbol == symbol))
        return result.scalar_one_or_none()

    async def get_all_stocks(self, limit: int = 100) -> List[Stock]:
        result = await self.db.execute(select(Stock).limit(limit))
        return list(result.scalars().all())

    async def get_historical_prices(self, symbol: str, limit: int = 30) -> List[HistoricalPrice]:
        result = await self.db.execute(
            select(HistoricalPrice)
            .where(HistoricalPrice.symbol == symbol)
            .order_by(HistoricalPrice.date.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
