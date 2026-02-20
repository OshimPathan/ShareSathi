from typing import Any, Dict
from fastapi import APIRouter
from app.services.market_service import MarketService
from app.config import settings

router = APIRouter()

@router.get("/summary")
async def read_summary() -> Dict[str, Any]:
    return await MarketService.get_summary()

@router.get("/live")
async def read_live_market() -> Dict[str, Any]:
    return await MarketService.get_live()

@router.get("/test-apify")
async def test_apify() -> Dict[str, Any]:
    return {
        "status": "success" if settings.APIFY_API_KEY else "failed",
        "key_loaded": bool(settings.APIFY_API_KEY),
        "key_preview": f"{settings.APIFY_API_KEY[:10]}..." if settings.APIFY_API_KEY else None
    }
