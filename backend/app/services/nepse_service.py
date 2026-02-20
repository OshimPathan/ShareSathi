import json
import asyncio
from typing import Any, Dict, Optional
import random
from datetime import datetime

from app.cache.cache_service import (
    get_cached_market_summary, set_cached_market_summary,
    get_cached_live_market, set_cached_live_market, get_backup_live_market
)
from app.utils.logger import logger

class NepseService:
    @staticmethod
    async def get_market_summary() -> Dict[str, Any]:
        return {
            "summary": {
                "nepseIndex": 2100.50 + random.uniform(-10, 10),
                "totalTurnover": 5000000000 + random.randint(-100000000, 100000000),
                "totalTradedShares": 15000000 + random.randint(-500000, 500000),
                "marketStatus": "Open"
            },
            "is_stale": False
        }

    @staticmethod
    async def get_live_market() -> Dict[str, Any]:
        symbols = ['NABIL', 'NICA', 'GBIME', 'KBL', 'PCAL', 'SHIVM', 'HRL']
        mock_live_data = []
        for sym in symbols:
            ltp = random.uniform(200, 1500)
            mock_live_data.append({
                "symbol": sym,
                "lastTradedPrice": round(ltp, 2),
                "pointChange": round(random.uniform(-10, 10), 2),
                "percentageChange": round(random.uniform(-2, 2), 2),
                "volume": random.randint(1000, 50000)
            })
            
        return {
            "live_market": mock_live_data,
            "is_stale": False
        }

    @staticmethod
    async def get_stock_details(symbol: str) -> Optional[Dict[str, Any]]:
        return {
            "company": {
                "symbol": symbol.upper(),
                "companyName": f"{symbol.upper()} Company Ltd.",
                "sector": "Mock Sector",
                "listedShares": 10000000,
                "paidUpCapital": 1000000000
            }
        }

    @staticmethod
    async def get_historical_data(symbol: str) -> Optional[Dict[str, Any]]:
        history = []
        base_price = random.uniform(200, 1500)
        for i in range(30):
            base_price += random.uniform(-5, 5)
            history.append({
                "date": f"2026-01-{i%30+1:02d}",
                "close": round(base_price, 2),
                "volume": random.randint(5000, 20000)
            })
        return {"history": history}
