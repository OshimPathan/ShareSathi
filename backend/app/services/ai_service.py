from typing import Dict, Any
from app.ai.inference.predict import run_prediction

class AiService:
    @staticmethod
    def get_stock_prediction(symbol: str, historical_data: Dict[str, Any]) -> Dict[str, Any]:
        return run_prediction(symbol, historical_data)
