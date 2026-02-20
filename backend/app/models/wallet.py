from sqlalchemy import Column, Integer, Numeric, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.sql import func
from app.database.base import Base

class Wallet(Base):
    __tablename__ = "wallet"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    balance = Column(Numeric(12, 2), default=100000.00, nullable=False) # NEP 1 Lakh default
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    __table_args__ = (
        CheckConstraint('balance >= 0', name='check_wallet_positive'),
    )
