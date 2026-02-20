from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

class TradeRequest(BaseModel):
    symbol: str
    quantity: int

class TransactionResponse(BaseModel):
    id: int
    symbol: str
    transaction_type: str
    quantity: int
    price: Decimal
    timestamp: datetime

    model_config = {"from_attributes": True}
