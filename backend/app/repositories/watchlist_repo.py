from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional

from app.models.watchlist import Watchlist
from app.schemas.watchlist_schema import WatchlistItemCreate, WatchlistItemUpdate

class WatchlistRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_watchlist(self, user_id: int) -> List[Watchlist]:
        result = await self.db.execute(
            select(Watchlist).where(Watchlist.user_id == user_id)
        )
        return list(result.scalars().all())

    async def get_watchlist_item(self, user_id: int, symbol: str) -> Optional[Watchlist]:
        result = await self.db.execute(
            select(Watchlist).where(
                and_(Watchlist.user_id == user_id, Watchlist.symbol == symbol)
            )
        )
        return result.scalar_one_or_none()

    async def add_item(self, user_id: int, item: WatchlistItemCreate) -> Watchlist:
        db_item = Watchlist(
            user_id=user_id,
            symbol=item.symbol.upper(),
            target_price=item.target_price,
            stop_loss=item.stop_loss
        )
        self.db.add(db_item)
        await self.db.commit()
        await self.db.refresh(db_item)
        return db_item

    async def update_item(self, user_id: int, symbol: str, data: WatchlistItemUpdate) -> Optional[Watchlist]:
        db_item = await self.get_watchlist_item(user_id, symbol)
        if not db_item:
            return None
        
        if data.target_price is not None:
            db_item.target_price = data.target_price
        if data.stop_loss is not None:
            db_item.stop_loss = data.stop_loss
            
        await self.db.commit()
        await self.db.refresh(db_item)
        return db_item

    async def remove_item(self, user_id: int, symbol: str) -> bool:
        db_item = await self.get_watchlist_item(user_id, symbol)
        if not db_item:
            return False
            
        await self.db.delete(db_item)
        await self.db.commit()
        return True
