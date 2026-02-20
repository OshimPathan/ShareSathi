from typing import Optional, List
from datetime import date
from pydantic import BaseModel
from decimal import Decimal

class StockBase(BaseModel):
    symbol: str
    company_name: str
    sector: Optional[str] = None
    total_listed_shares: Optional[int] = None

class StockResponse(StockBase):
    model_config = {"from_attributes": True}

class HistoricalPriceResponse(BaseModel):
    symbol: str
    date: date
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: int

    model_config = {"from_attributes": True}
