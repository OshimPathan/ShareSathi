from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ipo import Ipo
from app.repositories.ipo_repo import IpoRepository

class IpoService:
    def __init__(self, db: AsyncSession):
        self.ipo_repo = IpoRepository(db)

    async def get_all_ipos(self) -> List[Ipo]:
        return await self.ipo_repo.get_recent_ipos()
