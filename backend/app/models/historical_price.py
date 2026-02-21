from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Date, BigInteger, Index, UniqueConstraint
from app.database.base import Base

class HistoricalPrice(Base):
    __tablename__ = "historical_prices"
    __table_args__ = (
        UniqueConstraint("symbol", "date", name="uq_historical_symbol_date"),
        Index("ix_historical_symbol_date", "symbol", "date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, ForeignKey("stocks.symbol"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    open = Column(Numeric(10, 2), nullable=False)
    high = Column(Numeric(10, 2), nullable=False)
    low = Column(Numeric(10, 2), nullable=False)
    close = Column(Numeric(10, 2), nullable=False)
    volume = Column(BigInteger, nullable=False)
