from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.ipo_schema import IpoResponse
from app.services.ipo_service import IpoService

router = APIRouter()

@router.get("", response_model=List[IpoResponse])
async def get_all_ipos(db: AsyncSession = Depends(get_db)):
    ipo_service = IpoService(db)
    return await ipo_service.get_all_ipos()
