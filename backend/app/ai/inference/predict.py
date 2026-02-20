import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from typing import Dict, Any

def run_prediction(symbol: str, historical_data: Dict[str, Any]) -> Dict[str, Any]:
    history = historical_data.get("history", [])
    if not history:
        return {"error": "No historical data available for prediction."}
        
    closes = [day["close"] for day in history]
    
    if len(closes) < 30:
        return {"error": "Not enough data points for ARIMA. Need at least 30 days."}
        
    try:
        model = ARIMA(closes, order=(5, 1, 0))
        model_fit = model.fit()
        
        forecast_output = model_fit.forecast(steps=7)
        
        forecast = []
        
        from datetime import datetime, timedelta
        last_date_str = history[-1]["date"]
        last_date = datetime.strptime(last_date_str, "%Y-%m-%d")
        
        days_added = 0
        current_date = last_date + timedelta(days=1)
        forecast_index = 0
        
        while days_added < 7:
            if current_date.weekday() <= 4:
                predicted_price = float(forecast_output[forecast_index])
                forecast.append({
                    "date": current_date.strftime("%Y-%m-%d"),
                    "predicted_price": round(predicted_price, 2)
                })
                forecast_index += 1
                days_added += 1
            current_date += timedelta(days=1)

        returns = pd.Series(closes).pct_change().dropna()
        volatility = float(returns.std() * np.sqrt(252) * 100)
        
        if volatility > 40:
            risk_level = "High"
        elif volatility > 20:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return {
            "symbol": symbol.upper(),
            "7_day_forecast": forecast,
            "risk_classification": risk_level,
            "volatility_percentage": round(volatility, 2),
            "ai_confidence_score": 0.85,
            "model_used": "ARIMA(5,1,0)"
        }
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}
