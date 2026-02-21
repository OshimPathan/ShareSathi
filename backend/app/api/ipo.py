from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.ipo_schema import IpoResponse
from app.services.ipo_service import IpoService

router = APIRouter()

@router.get("")
async def get_all_ipos(status: Optional[str] = Query(default=None, description="Filter by status: OPEN, UPCOMING, CLOSED")):
    return await IpoService.get_all_ipos(status_filter=status)
