from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.wallet_schema import WalletResponse
from app.repositories.user_repo import UserRepository
from app.services.portfolio_service import PortfolioService

router = APIRouter()

@router.get("/wallet", response_model=WalletResponse)
async def get_my_wallet(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_repo = UserRepository(db)
    wallet = await user_repo.get_wallet(current_user.id)
    return wallet

@router.get("")
async def get_my_portfolio(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    portfolio_service = PortfolioService(db)
    return await portfolio_service.calculate_portfolio_pnl(current_user.id)
