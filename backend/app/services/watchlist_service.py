from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.watchlist import Watchlist
from app.repositories.watchlist_repo import WatchlistRepository

class WatchlistService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.watchlist_repo = WatchlistRepository(db)

    async def get_user_watchlist(self, user_id: int) -> List[Watchlist]:
        return await self.watchlist_repo.get_user_watchlist(user_id)

    async def add_symbol(self, user_id: int, symbol: str) -> Watchlist:
        entry = Watchlist(user_id=user_id, symbol=symbol)
        self.watchlist_repo.add_to_watchlist(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry
