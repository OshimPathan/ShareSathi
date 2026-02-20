from typing import Any, Dict
from fastapi import APIRouter
from app.services.news_service import NewsService

router = APIRouter()

@router.get("/latest")
async def read_latest_news(category: str = "All") -> Dict[str, Any]:
    return await NewsService.get_latest_news(category)

@router.get("/categories")
async def read_news_categories() -> Dict[str, Any]:
    return {
        "categories": ["All", "Corporate", "Market", "Hydropower", "IPO", "Sector Analysis", "Economy"]
    }
