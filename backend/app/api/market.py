from typing import Any, Dict
from fastapi import APIRouter, HTTPException
from app.services.market_service import MarketService

router = APIRouter()

@router.get("/summary")
async def read_summary() -> Dict[str, Any]:
    return await MarketService.get_summary()

@router.get("/companies")
async def read_companies() -> Dict[str, Any]:
    return await MarketService.get_companies()

@router.get("/live")
async def read_live_market() -> Dict[str, Any]:
    return await MarketService.get_live()

@router.get("/depth/{symbol}")
async def read_market_depth(symbol: str) -> Dict[str, Any]:
    return await MarketService.get_market_depth(symbol)

@router.get("/history/{symbol}")
async def read_stock_history(symbol: str) -> Dict[str, Any]:
    data = await MarketService.get_stock_history(symbol)
    if not data:
        return {"history": []}
    return data

@router.get("/fundamentals/{symbol}")
async def read_stock_fundamentals(symbol: str) -> Dict[str, Any]:
    return await MarketService.get_fundamentals(symbol)

@router.get("/forecast/{symbol}")
async def read_stock_forecast(symbol: str) -> Dict[str, Any]:
    return await MarketService.get_ai_forecast(symbol)
