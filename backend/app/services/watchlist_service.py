from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from decimal import Decimal

from app.repositories.watchlist_repo import WatchlistRepository
from app.schemas.watchlist_schema import WatchlistItemCreate, WatchlistItemUpdate
from app.services.nepse_service import NepseService

class WatchlistService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = WatchlistRepository(db)

    async def get_user_watchlist(self, user_id: int) -> Dict[str, Any]:
        items = await self.repo.get_user_watchlist(user_id)
        
        # Optionally, merge live market data to provide current price
        market_data = await NepseService.get_live_market()
        live_prices = {}
        if not market_data.get('is_stale', False) or market_data.get('live_market'):
            for stock in market_data.get("live_market", []):
                 live_prices[stock.get("symbol")] = stock.get("lastTradedPrice", 0)

        results = []
        for item in items:
            results.append({
                "id": item.id,
                "user_id": item.user_id,
                "symbol": item.symbol,
                "target_price": item.target_price,
                "stop_loss": item.stop_loss,
                "added_at": item.added_at,
                "current_price": float(live_prices.get(item.symbol, 0))
            })
            
        return {"items": results}

    async def add_item(self, user_id: int, item: WatchlistItemCreate) -> Dict[str, Any]:
        existing = await self.repo.get_watchlist_item(user_id, item.symbol.upper())
        if existing:
            # If exists, update instead
            update_data = WatchlistItemUpdate(target_price=item.target_price, stop_loss=item.stop_loss)
            db_item = await self.repo.update_item(user_id, item.symbol.upper(), update_data)
        else:
            db_item = await self.repo.add_item(user_id, item)
            
        return db_item.__dict__

    async def update_item(self, user_id: int, symbol: str, data: WatchlistItemUpdate) -> Dict[str, Any]:
        db_item = await self.repo.update_item(user_id, symbol.upper(), data)
        if not db_item:
            raise ValueError(f"Symbol {symbol} not in watchlist")
        return db_item.__dict__

    async def remove_item(self, user_id: int, symbol: str) -> bool:
        return await self.repo.remove_item(user_id, symbol.upper())
