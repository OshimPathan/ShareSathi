from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.portfolio import Portfolio

class PortfolioRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_portfolio(self, user_id: int) -> List[Portfolio]:
        result = await self.db.execute(
            select(Portfolio).where(Portfolio.user_id == user_id, Portfolio.quantity > 0)
        )
        return list(result.scalars().all())

    async def get_portfolio_item_for_update(self, user_id: int, symbol: str) -> Portfolio | None:
        result = await self.db.execute(
            select(Portfolio).where(Portfolio.user_id == user_id, Portfolio.symbol == symbol).with_for_update()
        )
        return result.scalar_one_or_none()

    def create(self, portfolio: Portfolio):
        self.db.add(portfolio)
