from typing import Dict, Any
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.models.user import User
from app.services.ai_service import AiService

router = APIRouter()

@router.get("/predict/{symbol}")
async def predict_stock(symbol: str, current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    return AiService.get_stock_prediction(symbol)
