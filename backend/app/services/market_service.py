from typing import Dict, Any, Optional
from app.services.nepse_service import NepseService

class MarketService:
    @staticmethod
    async def get_summary() -> Dict[str, Any]:
        return await NepseService.get_market_summary()

    @staticmethod
    async def get_live() -> Dict[str, Any]:
        return await NepseService.get_live_market()

    @staticmethod
    async def get_stock_detail(symbol: str) -> Optional[Dict[str, Any]]:
        return await NepseService.get_stock_details(symbol)

    @staticmethod
    async def get_stock_history(symbol: str) -> Optional[Dict[str, Any]]:
        return await NepseService.get_historical_data(symbol)
