from decimal import Decimal
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.portfolio_repo import PortfolioRepository
from app.services.nepse_service import NepseService

class PortfolioService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.portfolio_repo = PortfolioRepository(db)

    async def calculate_portfolio_pnl(self, user_id: int) -> Dict[str, Any]:
        portfolios = await self.portfolio_repo.get_user_portfolio(user_id)
        
        market_data = await NepseService.get_live_market()
        live_prices = {}
        if not market_data.get('is_stale', False) or market_data.get('live_market'):
            for stock in market_data.get("live_market", []):
                 live_prices[stock.get("symbol")] = Decimal(str(stock.get("lastTradedPrice", 0)))

        total_investment = Decimal("0.0")
        total_current_value = Decimal("0.0")
        assets = []

        for p in portfolios:
            current_price = live_prices.get(p.symbol, p.average_buy_price)
            investment = p.quantity * p.average_buy_price
            current_value = p.quantity * current_price
            pnl = current_value - investment
            
            funds = await NepseService.get_fundamentals(p.symbol)
            sector = funds.get("sector", "Others")
            
            assets.append({
                "symbol": p.symbol,
                "sector": sector,
                "quantity": p.quantity,
                "average_buy_price": p.average_buy_price,
                "current_price": current_price,
                "investment": investment,
                "current_value": current_value,
                "pnl": pnl,
                "pnl_percentage": (pnl / investment * 100) if investment > 0 else 0
            })

            total_investment += investment
            total_current_value += current_value

        total_pnl = total_current_value - total_investment
        overall_pnl_percentage = (total_pnl / total_investment * 100) if total_investment > 0 else Decimal("0.0")

        return {
            "assets": assets,
            "summary": {
                "total_investment": total_investment,
                "total_current_value": total_current_value,
                "total_pnl": total_pnl,
                "overall_pnl_percentage": overall_pnl_percentage
            }
        }
