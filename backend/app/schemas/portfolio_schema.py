from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

class PortfolioResponse(BaseModel):
    symbol: str
    quantity: int
    average_buy_price: Decimal
    updated_at: datetime

    model_config = {"from_attributes": True}
