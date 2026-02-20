from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel

class WalletResponse(BaseModel):
    balance: Decimal
    updated_at: datetime
    
    model_config = {"from_attributes": True}
