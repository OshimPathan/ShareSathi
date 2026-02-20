from typing import Any, Dict
from fastapi import APIRouter
from app.services.market_service import MarketService

router = APIRouter()

@router.get("/summary")
async def read_summary() -> Dict[str, Any]:
    return await MarketService.get_summary()

@router.get("/live")
async def read_live_market() -> Dict[str, Any]:
    return await MarketService.get_live()
