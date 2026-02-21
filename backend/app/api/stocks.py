from typing import Any, Dict
from fastapi import APIRouter, HTTPException
from app.services.market_service import MarketService

router = APIRouter()

@router.get("/{symbol}")
async def read_stock_details(symbol: str) -> Dict[str, Any]:
    data = await MarketService.get_stock_detail(symbol.upper())
    if not data:
        raise HTTPException(status_code=404, detail=f"Stock '{symbol}' not found")
    return data

@router.get("/{symbol}/history")
async def read_stock_history(symbol: str) -> Dict[str, Any]:
    data = await MarketService.get_stock_history(symbol.upper())
    if not data:
        raise HTTPException(status_code=404, detail=f"Historical data for '{symbol}' not found")
    return data
