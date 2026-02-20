from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database.base import Base

class Portfolio(Base):
    __tablename__ = "portfolio"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    symbol = Column(String, ForeignKey("stocks.symbol"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=0)
    average_buy_price = Column(Numeric(10, 2), nullable=False, default=0.00)
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
