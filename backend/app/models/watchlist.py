from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.database.base import Base

class Watchlist(Base):
    __tablename__ = "watchlist"
    __table_args__ = (
        UniqueConstraint("user_id", "symbol", name="uq_watchlist_user_symbol"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    symbol = Column(String, ForeignKey("stocks.symbol"), nullable=False, index=True)
    target_price = Column(Float, nullable=True)
    stop_loss = Column(Float, nullable=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
