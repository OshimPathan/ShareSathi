from typing import Dict, Any
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.models.user import User
from app.services.ai_service import AiService

router = APIRouter()

@router.get("/predict/{symbol}")
async def predict_stock(symbol: str, current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    from app.services.nepse_service import NepseService
    hist_data = await NepseService.get_historical_data(symbol.upper())
    return AiService.get_stock_prediction(symbol, hist_data)
