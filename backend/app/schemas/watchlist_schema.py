from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class WatchlistItemBase(BaseModel):
    symbol: str = Field(..., description="The stock symbol to add to tracking")
    target_price: Optional[float] = Field(None, description="Upper price alert")
    stop_loss: Optional[float] = Field(None, description="Lower price alert")

class WatchlistItemCreate(WatchlistItemBase):
    pass

class WatchlistItemUpdate(BaseModel):
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None

class WatchlistItemResponse(WatchlistItemBase):
    id: int
    user_id: int
    added_at: datetime
    
    class Config:
        from_attributes = True

class WatchlistResponse(BaseModel):
    items: List[WatchlistItemResponse]
    
    class Config:
        from_attributes = True
