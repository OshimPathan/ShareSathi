from sqlalchemy import Column, Integer, String, Date
from app.database.base import Base

class Ipo(Base):
    __tablename__ = "ipo"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    sector = Column(String, nullable=True)
    units = Column(String, nullable=True) # E.g., "10,00,000"
    status = Column(String, nullable=False) # "OPEN", "CLOSED", "UPCOMING"
    opening_date = Column(Date, nullable=True)
    closing_date = Column(Date, nullable=True)
