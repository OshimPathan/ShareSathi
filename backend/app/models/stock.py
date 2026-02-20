from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, Date, BigInteger
from sqlalchemy.sql import func
from app.database.base import Base

class Stock(Base):
    __tablename__ = "stocks"

    symbol = Column(String, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    sector = Column(String, nullable=True)
    total_listed_shares = Column(BigInteger, nullable=True)
