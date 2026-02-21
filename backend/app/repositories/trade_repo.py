from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.transaction import Transaction

class TradeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def record_transaction(self, transaction: Transaction):
        self.db.add(transaction)

    async def get_user_transactions(self, user_id: int, limit: int = 50, offset: int = 0) -> List[Transaction]:
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.timestamp.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(result.scalars().all())
