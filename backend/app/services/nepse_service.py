import json
import asyncio
from typing import Any, Dict, Optional
import random
from datetime import datetime
import hashlib
from nepse import AsyncNepse

from app.cache.cache_service import (
    get_cached_market_summary, set_cached_market_summary,
    get_cached_live_market, set_cached_live_market, get_backup_live_market,
    get_cached_companies, set_cached_companies,
    get_cached_fundamentals, set_cached_fundamentals
)
from app.utils.logger import logger

class NepseService:
    _nepse: Optional[AsyncNepse] = None

    @classmethod
    def get_nepse(cls) -> AsyncNepse:
        if cls._nepse is None:
            cls._nepse = AsyncNepse()
            cls._nepse.setTLSVerification(False)
        return cls._nepse

    @staticmethod
    def parse_float(val: str) -> float:
        try:
            return float(val.replace(",", "").replace("Rs", "").strip())
        except:
            return 0.0

    @classmethod
    async def get_market_summary(cls) -> Dict[str, Any]:
        # Check cache first
        cached = await get_cached_market_summary()
        if cached:
            return cached

        n = cls.get_nepse()
        try:
            summary_raw, indices_raw, subindices_raw, gainers_raw, losers_raw, turnovers_raw, is_open = await asyncio.gather(
                n.getSummary(),
                n.getNepseIndex(),
                n.getNepseSubIndices(),
                n.getTopGainers(),
                n.getTopLosers(),
                n.getTopTenTurnoverScrips(),
                n.isNepseOpen()
            )

            summary_dict = {item["detail"]: item["value"] for item in summary_raw}
            
            nepse_index_data = next((item for item in indices_raw if item["index"] == "NEPSE Index"), None)
            nepse_index_val = nepse_index_data["currentValue"] if nepse_index_data else 0.0

            subIndices = []
            for item in subindices_raw:
                subIndices.append({
                    "sector": item.get("index", "").replace(" SubIndex", "").replace(" Index", ""),
                    "value": float(item.get("currentValue", 0)),
                    "change": float(item.get("change", 0))
                })

            topGainers = []
            for item in gainers_raw:
                topGainers.append({
                    "symbol": item.get("symbol"),
                    "ltp": float(item.get("ltp", 0)),
                    "pointChange": float(item.get("pointChange", 0)),
                    "percentageChange": float(item.get("percentageChange", 0))
                })

            topLosers = []
            for item in losers_raw:
                topLosers.append({
                    "symbol": item.get("symbol"),
                    "ltp": float(item.get("ltp", 0)),
                    "pointChange": float(item.get("pointChange", 0)),
                    "percentageChange": float(item.get("percentageChange", 0))
                })

            topTurnovers = []
            for item in turnovers_raw:
                topTurnovers.append({
                    "symbol": item.get("symbol"),
                    "turnover": float(item.get("turnover", 0))
                })

            result = {
                "summary": {
                    "nepseIndex": float(nepse_index_val),
                    "totalTurnover": cls.parse_float(str(summary_dict.get("Total Turnover", "0"))),
                    "totalTradedShares": cls.parse_float(str(summary_dict.get("Total Traded Shares", "0"))),
                    "marketStatus": "Open" if is_open else "Closed"
                },
                "subIndices": subIndices,
                "topGainers": topGainers,
                "topLosers": topLosers,
                "topTurnovers": topTurnovers,
                "is_stale": False
            }
            await set_cached_market_summary(result)
            return result
        except Exception as e:
            logger.error(f"Failed to fetch market summary from nepse_service: {e}")
            return {
                "summary": {"nepseIndex": 0, "totalTurnover": 0, "totalTradedShares": 0, "marketStatus": "Closed"},
                "subIndices": [], "topGainers": [], "topLosers": [], "topTurnovers": [], "is_stale": True
            }

    @classmethod
    async def get_live_market(cls) -> Dict[str, Any]:
        # Check cache first
        cached = await get_cached_live_market()
        if cached:
            return json.loads(cached)

        n = cls.get_nepse()
        try:
            live_data = await n.getLiveMarket()
            formatted_data = []
            for stock in live_data:
                ltp = float(stock.get("lastTradedPrice", 0))
                prev = float(stock.get("previousClose", 0))
                formatted_data.append({
                    "symbol": stock.get("symbol"),
                    "lastTradedPrice": ltp,
                    "pointChange": round(ltp - prev, 2),
                    "percentageChange": float(stock.get("percentageChange", 0)),
                    "volume": int(stock.get("totalTradeQuantity", 0))
                })
            result = {"live_market": formatted_data, "is_stale": False}
            await set_cached_live_market(result)
            return result
        except Exception as e:
            logger.error(f"Failed to fetch live market: {e}")
            return {"live_market": [], "is_stale": True}

    @classmethod
    async def get_stock_details(cls, symbol: str) -> Optional[Dict[str, Any]]:
        n = cls.get_nepse()
        companies = await n.getCompanyList()
        company = next((c for c in companies if c.get("symbol") == symbol.upper()), None)
        if company:
            return {
                "company": {
                    "symbol": company.get("symbol"),
                    "companyName": company.get("securityName"),
                    "sector": company.get("sectorName"),
                    "listedShares": None,
                    "paidUpCapital": None,
                    "_note": "listedShares and paidUpCapital are not available from the unofficial NEPSE API"
                }
            }
        return None

    @classmethod
    async def get_company_list(cls) -> Dict[str, Any]:
        # Check cache first
        cached = await get_cached_companies()
        if cached:
            return cached

        n = cls.get_nepse()
        try:
            companies = await n.getCompanyList()
            formatted = [{"symbol": c.get("symbol"), "name": c.get("securityName"), "sector": c.get("sectorName")} for c in companies if c.get("symbol")]
            result = {"companies": formatted}
            await set_cached_companies(result)
            return result
        except Exception as e:
            logger.error(f"Failed to fetch companies: {e}")
            return {"companies": []}

    @classmethod
    async def get_historical_data(cls, symbol: str) -> Optional[Dict[str, Any]]:
        n = cls.get_nepse()
        try:
            history_data = await n.getCompanyPriceVolumeHistory(symbol.upper())
            formatted_history = []
            
            history_data = sorted(history_data, key=lambda x: x.get('businessDate', ''))
            
            for item in history_data:
                formatted_history.append({
                    "time": item.get('businessDate'),
                    "open": float(item.get('openPrice', 0)) if item.get('openPrice') is not None else float(item.get('closePrice', 0)),
                    "high": float(item.get('highPrice', 0)),
                    "low": float(item.get('lowPrice', 0)),
                    "close": float(item.get('closePrice', 0)),
                    "volume": int(item.get('totalTradedQuantity', 0))
                })
            return {"history": formatted_history}
        except Exception as e:
            logger.error(f"Failed to fetch historical data for {symbol}: {e}")
            return {"history": []}

    @classmethod
    async def get_fundamentals(cls, symbol: str) -> Dict[str, Any]:
        """Fetch real company details from API. EPS, P/E, div yield are estimated (not from official source)."""
        # Check cache first
        cached = await get_cached_fundamentals(symbol.upper())
        if cached:
            return cached

        n = cls.get_nepse()
        try:
            details_response = await n.getCompanyDetails(symbol.upper())
            security_trade = details_response.get('securityDailyTradeDto', {})
            security = details_response.get('security', {})
            
            companies = await n.getCompanyList()
            company = next((c for c in companies if c.get("symbol") == symbol.upper()), None)
            sector = company.get("sectorName", "Others") if company else "Others"
            
            paid_up_capital = float(company.get("activeStatus", 1) * 1000000000) if company else 1000000000 
            fifty_two_week_high = float(security_trade.get('fiftyTwoWeekHigh', 0))
            fifty_two_week_low = float(security_trade.get('fiftyTwoWeekLow', 0))
            
            # NOTE: EPS, P/E, book value, dividend yield are estimated values
            # since the unofficial NEPSE API does not provide these.
            # They use a deterministic seed per symbol for consistency.
            seed_value = int(hashlib.sha256(symbol.encode('utf-8')).hexdigest(), 16) % 10**8
            random.seed(seed_value)

            eps = random.uniform(-10, 50)
            pe = random.uniform(5, 50) if eps > 0 else 0
            book_value = random.uniform(50, 400)
            dividend_yield = random.uniform(0, 15)
            
            data = {
                "symbol": symbol.upper(),
                "sector": sector,
                "eps": round(eps, 2),
                "peRatio": round(pe, 2),
                "bookValue": round(book_value, 2),
                "paidUpCapital": round(paid_up_capital, 2),
                "dividendYield": round(dividend_yield, 2),
                "pbvRatio": round(random.uniform(0.5, 5), 2),
                "52WeekHigh": round(fifty_two_week_high, 2),
                "52WeekLow": round(fifty_two_week_low, 2),
                "marketCap": round(paid_up_capital * random.uniform(1, 5), 2),
                "_is_estimated": True,
                "_disclaimer": "⚠️ PAPER TRADING ONLY: EPS, P/E, Book Value, Dividend Yield, PBV, Market Cap are estimated values generated for educational purposes. They do NOT reflect actual company financials. Only 52-Week High/Low are real NEPSE data. Do NOT use these for real investment decisions.",
                "_estimated_fields": ["eps", "peRatio", "bookValue", "dividendYield", "pbvRatio", "marketCap", "paidUpCapital"]
            }
            random.seed() 
            await set_cached_fundamentals(symbol.upper(), data)
            return data
        except Exception as e:
            logger.error(f"Failed to fetch fundamentals for {symbol}: {e}")
            return {
                "symbol": symbol.upper(), "sector": "Unknown", "eps": 0, "peRatio": 0, "bookValue": 0,
                "paidUpCapital": 0, "dividendYield": 0, "pbvRatio": 0, "52WeekHigh": 0, "52WeekLow": 0, "marketCap": 0
            }

    @staticmethod
    async def get_ai_forecast(symbol: str) -> Dict[str, Any]:
        n = NepseService.get_nepse()
        try:
            live_market = await n.getLiveMarket()
            stock_data = next((s for s in live_market if s.get("symbol") == symbol.upper()), None)
            current_price = float(stock_data.get("lastTradedPrice", 0)) if stock_data else 500.0
            
            date_str = datetime.now().strftime("%Y-%m-%d")
            seed_value = int(hashlib.sha256((symbol + date_str).encode('utf-8')).hexdigest(), 16) % 10**8
            random.seed(seed_value)
    
            signals = ["STRONG BUY", "BUY", "HOLD", "SELL", "STRONG SELL"]
            signal = random.choices(signals, weights=[15, 30, 30, 15, 10])[0]
            confidence = random.randint(60, 95)
            
            if "BUY" in signal:
                target_price = current_price * random.uniform(1.05, 1.25)
                stop_loss = current_price * random.uniform(0.85, 0.95)
                reasoning = f"{symbol} shows strong bullish momentum. Technical indicators (MACD and RSI) align with positive volume inflows. The recent breakout above the 50-day moving average suggests further upside potential."
            elif "SELL" in signal:
                target_price = current_price * random.uniform(0.75, 0.90)
                stop_loss = current_price * random.uniform(1.05, 1.15)
                reasoning = f"{symbol} faces significant resistance at current levels. Bearish divergence is visible on the RSI, predicting a short-term pullback. Support levels might be tested in the coming sessions."
            else:
                target_price = current_price * random.uniform(0.95, 1.05)
                stop_loss = current_price * random.uniform(0.90, 0.95)
                reasoning = f"{symbol} is currently consolidating in a tight range. Technicals remain neutral, and volatility is contracting. Wait for a decisive breakout above resistance or breakdown below support before taking a position."
    
            data = {
                "symbol": symbol.upper(),
                "signal": signal,
                "confidence": confidence,
                "targetPrice": round(target_price, 2),
                "stopLoss": round(stop_loss, 2),
                "reasoning": reasoning,
                "timestamp": datetime.now().isoformat(),
                "_disclaimer": "⚠️ SIMULATED DATA: This forecast is randomly generated for educational/demo purposes. It is NOT based on real technical analysis, machine learning, or any actual market data. Do NOT use this for real investment decisions.",
                "_is_simulated": True
            }
            random.seed()
            return data
        except Exception as e:
            logger.error(f"Failed to generate AI forecast for {symbol}: {e}")
            return {
                "symbol": symbol.upper(), "signal": "HOLD", "confidence": 0, "targetPrice": 0, "stopLoss": 0,
                "reasoning": "Error generating forecast.", "timestamp": datetime.now().isoformat()
            }

    @classmethod
    async def get_market_depth(cls, symbol: str) -> Dict[str, Any]:
        """Fetch Level 2 Market Depth from API"""
        n = cls.get_nepse()
        try:
            depth = await n.getSymbolMarketDepth(symbol.upper())
            market_depth = depth.get("marketDepth", {})
            bids = market_depth.get("buyMarketDepthList", [])
            asks = market_depth.get("sellMarketDepthList", [])
            
            formatted_bids = []
            for b in bids:
                formatted_bids.append({
                    "price": b.get("orderBookQuantity", 0), # Some weird key mapping, I'll map directly below
                    "quantity": b.get("orderBookQuantity", 0),
                    "orders": b.get("orderCount", 0)
                })
                
            # For accurate keys in NepseUnofficialApi:
            formatted_bids = [{"price": b.get("orderPrice", 0), "quantity": b.get("orderBookQuantity", 0), "orders": b.get("orderCount", 0)} for b in bids]
            formatted_asks = [{"price": a.get("orderPrice", 0), "quantity": a.get("orderBookQuantity", 0), "orders": a.get("orderCount", 0)} for a in asks]
                
            return {
                "symbol": symbol.upper(),
                "bids": formatted_bids,
                "asks": formatted_asks,
                "totalBidQty": sum(b["quantity"] for b in formatted_bids),
                "totalAskQty": sum(a["quantity"] for a in formatted_asks)
            }
        except Exception:
            return {"symbol": symbol.upper(), "bids": [], "asks": [], "totalBidQty": 0, "totalAskQty": 0}

