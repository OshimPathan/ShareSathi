from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.wallet import Wallet

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
        
    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def create_user(self, email: str, hashed_password: str) -> User:
        db_user = User(email=email, password_hash=hashed_password)
        self.db.add(db_user)
        await self.db.flush()
        
        # Create initial wallet
        db_wallet = Wallet(user_id=db_user.id)
        self.db.add(db_wallet)
        
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    async def get_wallet(self, user_id: int) -> Optional[Wallet]:
        result = await self.db.execute(select(Wallet).where(Wallet.user_id == user_id))
        return result.scalar_one_or_none()
    
    async def get_wallet_for_update(self, user_id: int) -> Optional[Wallet]:
        result = await self.db.execute(select(Wallet).where(Wallet.user_id == user_id).with_for_update())
        return result.scalar_one_or_none()
