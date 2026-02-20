from typing import Any, Dict
from fastapi import APIRouter
from app.services.market_service import MarketService

router = APIRouter()

@router.get("/{symbol}")
async def read_stock_details(symbol: str) -> Dict[str, Any]:
    data = await MarketService.get_stock_detail(symbol.upper())
    if not data:
        return {"error": "Stock not found or API failure"}
    return data

@router.get("/{symbol}/history")
async def read_stock_history(symbol: str) -> Dict[str, Any]:
    data = await MarketService.get_stock_history(symbol.upper())
    if not data:
        return {"error": "Historical data not found or API failure"}
    return data
