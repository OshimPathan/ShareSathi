from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.watchlist import Watchlist

class WatchlistRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_watchlist(self, user_id: int) -> List[Watchlist]:
        result = await self.db.execute(select(Watchlist).where(Watchlist.user_id == user_id))
        return list(result.scalars().all())

    def add_to_watchlist(self, entry: Watchlist):
        self.db.add(entry)
