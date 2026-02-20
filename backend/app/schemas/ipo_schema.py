from typing import Optional
from pydantic import BaseModel
from datetime import date

class IpoResponse(BaseModel):
    id: int
    company_name: str
    sector: Optional[str]
    units: Optional[str]
    status: str
    opening_date: Optional[date]
    closing_date: Optional[date]

    model_config = {"from_attributes": True}
