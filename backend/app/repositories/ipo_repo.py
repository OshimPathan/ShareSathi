from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.ipo import Ipo

class IpoRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_recent_ipos(self, limit: int = 20) -> List[Ipo]:
        result = await self.db.execute(select(Ipo).order_by(Ipo.id.desc()).limit(limit))
        return list(result.scalars().all())
