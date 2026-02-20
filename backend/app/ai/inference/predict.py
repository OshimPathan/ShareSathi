import random
from typing import Dict, Any

def run_prediction(symbol: str) -> Dict[str, Any]:
    """
    Mock inference using a baseline random walk.
    """
    base_price = 500.0 + random.uniform(-100, 100)
    forecast = []
    
    for i in range(1, 8):
        change = random.uniform(-2.5, 3.0) 
        base_price *= (1 + change/100)
        forecast.append({
            "day": i,
            "predicted_price": round(base_price, 2)
        })
        
    risk_level = "High" if random.random() > 0.6 else "Medium"
    if random.random() < 0.2:
        risk_level = "Low"

    return {
        "symbol": symbol.upper(),
        "7_day_forecast": forecast,
        "risk_classification": risk_level,
        "ai_confidence_score": round(random.uniform(0.65, 0.95), 2),
        "model_used": "ARIMA-Baseline-Mock"
    }
