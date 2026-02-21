import logging
from typing import Dict, Any
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction
from app.models.portfolio import Portfolio
from app.repositories.user_repo import UserRepository
from app.repositories.portfolio_repo import PortfolioRepository
from app.repositories.trade_repo import TradeRepository
from app.services.nepse_service import NepseService

logger = logging.getLogger(__name__)

# Nepal Standard Time = UTC+5:45
NPT_OFFSET = timedelta(hours=5, minutes=45)

# ─── NEPSE Brokerage Fee Schedule ───────────────────────────
# Based on SEBON's tiered commission structure for stock trading.
# These are approximate and for paper trading educational purposes.
BROKERAGE_TIERS = [
    (50_000, Decimal("0.36")),        # up to 50k: 0.36%
    (500_000, Decimal("0.33")),       # 50k-500k: 0.33%
    (2_000_000, Decimal("0.31")),     # 500k-2M: 0.31%
    (10_000_000, Decimal("0.27")),    # 2M-10M: 0.27%
    (float("inf"), Decimal("0.24")),  # 10M+: 0.24%
]
SEBON_FEE_RATE = Decimal("0.015")      # 0.015% SEBON regulation fee
DP_CHARGE = Decimal("25.00")            # Rs 25 per transaction (DP charge)


def calculate_brokerage(trade_amount: Decimal) -> Decimal:
    """Calculate tiered NEPSE brokerage commission."""
    remaining = trade_amount
    total_commission = Decimal("0")
    prev_limit = Decimal("0")
    for limit, rate in BROKERAGE_TIERS:
        tier_amount = min(remaining, Decimal(str(limit)) - prev_limit)
        if tier_amount <= 0:
            break
        total_commission += tier_amount * rate / Decimal("100")
        remaining -= tier_amount
        prev_limit = Decimal(str(limit))
    return total_commission.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_total_fees(trade_amount: Decimal) -> Dict[str, Decimal]:
    """Calculate all trading fees: brokerage + SEBON fee + DP charge."""
    brokerage = calculate_brokerage(trade_amount)
    sebon_fee = (trade_amount * SEBON_FEE_RATE / Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return {
        "brokerage": brokerage,
        "sebon_fee": sebon_fee,
        "dp_charge": DP_CHARGE,
        "total_fees": brokerage + sebon_fee + DP_CHARGE,
    }


def is_market_hours() -> bool:
    """Check if current time is within NEPSE trading hours (Sun-Thu 11:00-15:00 NPT)."""
    now_utc = datetime.now(timezone.utc)
    now_npt = now_utc + NPT_OFFSET
    weekday = now_npt.weekday()  # 0=Mon ... 6=Sun
    # NEPSE trades Sun(6)-Thu(3) — in Python: Sun=6, Mon=0, Tue=1, Wed=2, Thu=3
    trading_days = {6, 0, 1, 2, 3}  # Sun, Mon, Tue, Wed, Thu
    if weekday not in trading_days:
        return False
    hour = now_npt.hour
    minute = now_npt.minute
    # Market open: 11:00, close: 15:00 NPT
    if hour < 11 or hour >= 15:
        return False
    return True


class TradingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.portfolio_repo = PortfolioRepository(db)
        self.trade_repo = TradeRepository(db)

    async def _get_current_price(self, symbol: str) -> Decimal:
        market_data = await NepseService.get_live_market()
        if market_data.get('is_stale', False) and not market_data.get('live_market'):
            raise HTTPException(status_code=503, detail="Market data unavailable")
            
        for stock in market_data.get("live_market", []):
            if stock.get("symbol") == symbol:
                return Decimal(str(stock.get("lastTradedPrice", 0)))
                
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found in live market")

    async def execute_buy(self, user_id: int, symbol: str, quantity: int) -> Transaction:
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")
        if quantity < 10:
            raise HTTPException(status_code=400, detail="Minimum order size is 10 shares (NEPSE lot size)")

        # Check trading hours (warn but allow for paper trading)
        market_open = is_market_hours()

        price = await self._get_current_price(symbol)
        trade_amount = price * quantity

        # Calculate fees
        fees = calculate_total_fees(trade_amount)
        total_cost = trade_amount + fees["total_fees"]

        wallet = await self.user_repo.get_wallet_for_update(user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")

        if wallet.balance < total_cost:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient balance. Need Rs. {total_cost:.2f} (shares: {trade_amount:.2f} + fees: {fees['total_fees']:.2f}) but have Rs. {wallet.balance:.2f}"
            )

        portfolio = await self.portfolio_repo.get_portfolio_item_for_update(user_id, symbol)

        if portfolio:
            total_value = (portfolio.quantity * portfolio.average_buy_price) + trade_amount
            new_quantity = portfolio.quantity + quantity
            portfolio.quantity = new_quantity
            portfolio.average_buy_price = total_value / new_quantity
        else:
            portfolio = Portfolio(
                user_id=user_id,
                symbol=symbol,
                quantity=quantity,
                average_buy_price=price
            )
            self.portfolio_repo.create(portfolio)

        wallet.balance -= total_cost

        transaction = Transaction(
            user_id=user_id,
            symbol=symbol,
            transaction_type="BUY",
            quantity=quantity,
            price=price
        )
        self.trade_repo.record_transaction(transaction)

        await self.db.commit()
        await self.db.refresh(transaction)

        logger.info(
            f"BUY executed: user={user_id} symbol={symbol} qty={quantity} "
            f"price={price} fees={fees['total_fees']} market_open={market_open}"
        )
        return transaction

    async def execute_sell(self, user_id: int, symbol: str, quantity: int) -> Transaction:
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than 0")
        if quantity < 10:
            raise HTTPException(status_code=400, detail="Minimum order size is 10 shares (NEPSE lot size)")

        market_open = is_market_hours()

        price = await self._get_current_price(symbol)
        trade_amount = price * quantity

        # Calculate fees
        fees = calculate_total_fees(trade_amount)
        net_revenue = trade_amount - fees["total_fees"]

        portfolio = await self.portfolio_repo.get_portfolio_item_for_update(user_id, symbol)
        if not portfolio or portfolio.quantity < quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock quantity")

        wallet = await self.user_repo.get_wallet_for_update(user_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")

        portfolio.quantity -= quantity
        if portfolio.quantity == 0:
            portfolio.average_buy_price = Decimal("0.00")

        wallet.balance += net_revenue

        transaction = Transaction(
            user_id=user_id,
            symbol=symbol,
            transaction_type="SELL",
            quantity=quantity,
            price=price
        )
        self.trade_repo.record_transaction(transaction)

        await self.db.commit()
        await self.db.refresh(transaction)

        logger.info(
            f"SELL executed: user={user_id} symbol={symbol} qty={quantity} "
            f"price={price} fees={fees['total_fees']} net={net_revenue} market_open={market_open}"
        )
        return transaction
