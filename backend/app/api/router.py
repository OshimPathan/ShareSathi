from fastapi import APIRouter

from app.api import auth, market, stocks, portfolio, trading, ipo, ai, watchlist, news

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(market.router, prefix="/market", tags=["Market Data"])
api_router.include_router(stocks.router, prefix="/stocks", tags=["Stocks"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio"])
api_router.include_router(trading.router, prefix="/trade", tags=["Trading"])
api_router.include_router(ipo.router, prefix="/ipo", tags=["IPO Info"])
api_router.include_router(watchlist.router, prefix="/watchlist", tags=["Watchlist"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Predictions"])
api_router.include_router(news.router, prefix="/news", tags=["News"])
