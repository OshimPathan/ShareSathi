#!/usr/bin/env python3
"""
ShareSathi — Real Data Sync Pipeline
=====================================
Fetches LIVE data from NEPSE (via NepseUnofficialApi) and real financial news,
then pushes it into the InsForge database via REST-RPC calls.

Usage:
    python sync_to_insforge.py              # One-shot full sync
    python sync_to_insforge.py --prices     # Only sync stock prices + market summary
    python sync_to_insforge.py --news       # Only sync news
    python sync_to_insforge.py --ipo        # Only sync IPO data
    python sync_to_insforge.py --history    # Only sync historical prices
    python sync_to_insforge.py --daemon     # Run on schedule (every 2 min prices, 30 min news)
"""

import asyncio
import json
import sys
import os
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import httpx
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Configuration (loaded from environment variables)
# ---------------------------------------------------------------------------
INSFORGE_BASE_URL = os.environ.get("INSFORGE_BASE_URL", "")
INSFORGE_ANON_KEY = os.environ.get("INSFORGE_ANON_KEY", "")

if not INSFORGE_BASE_URL or not INSFORGE_ANON_KEY:
    print("ERROR: INSFORGE_BASE_URL and INSFORGE_ANON_KEY environment variables are required.")
    print("Set them in your .env file or export them before running this script.")
    sys.exit(1)

RPC_URL = f"{INSFORGE_BASE_URL}/api/database/rpc"
HEADERS = {
    "Authorization": f"Bearer {INSFORGE_ANON_KEY}",
    "Content-Type": "application/json",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("sync")

# ---------------------------------------------------------------------------
# InsForge RPC helper
# ---------------------------------------------------------------------------
async def call_rpc(client: httpx.AsyncClient, fn_name: str, payload: Any) -> dict:
    """Call an InsForge SECURITY DEFINER function via REST RPC."""
    url = f"{RPC_URL}/{fn_name}"
    resp = await client.post(url, json=payload, headers=HEADERS, timeout=60)
    if resp.status_code >= 400:
        log.error(f"RPC {fn_name} failed ({resp.status_code}): {resp.text[:500]}")
        return {"error": resp.text[:500]}
    try:
        return resp.json()
    except Exception:
        return {"raw": resp.text[:200]}


# ===========================================================================
# 1. NEPSE Market Data  (via NepseUnofficialApi)
# ===========================================================================
async def fetch_and_sync_market(client: httpx.AsyncClient):
    """Fetch live market data from NEPSE and push to InsForge."""
    from nepse import AsyncNepse

    log.info("⏳ Connecting to NEPSE API...")
    n = AsyncNepse()
    n.setTLSVerification(False)

    try:
        # Parallel fetch from NEPSE
        (
            summary_raw,
            indices_raw,
            subindices_raw,
            gainers_raw,
            losers_raw,
            turnovers_raw,
            is_open,
            live_data,
            company_list,
        ) = await asyncio.gather(
            n.getSummary(),
            n.getNepseIndex(),
            n.getNepseSubIndices(),
            n.getTopGainers(),
            n.getTopLosers(),
            n.getTopTenTurnoverScrips(),
            n.isNepseOpen(),
            n.getLiveMarket(),
            n.getCompanyList(),
        )
        log.info(f"✅ NEPSE data fetched — {len(live_data)} stocks, market {'OPEN' if is_open else 'CLOSED'}")
    except Exception as e:
        log.error(f"❌ Failed to fetch from NEPSE: {e}")
        return

    # ---------- Build company lookup ----------
    company_map: Dict[str, dict] = {}
    for c in company_list:
        sym = c.get("symbol")
        if sym:
            company_map[sym] = {
                "name": c.get("securityName", sym),
                "sector": c.get("sectorName"),
            }

    # ---------- Build stock records ----------
    stocks_payload: List[dict] = []
    for stock in live_data:
        sym = stock.get("symbol")
        if not sym:
            continue
        ltp = float(stock.get("lastTradedPrice", 0) or 0)
        prev = float(stock.get("previousClose", 0) or 0)
        pct = float(stock.get("percentageChange", 0) or 0)
        vol = int(stock.get("totalTradeQuantity", 0) or 0)
        turnover = float(stock.get("totalTradeValue", 0) or 0)
        high = float(stock.get("highPrice", 0) or 0)
        low = float(stock.get("lowPrice", 0) or 0)
        open_price = float(stock.get("openPrice", 0) or 0)
        info = company_map.get(sym, {})
        stocks_payload.append({
            "symbol": sym,
            "company_name": info.get("name", sym),
            "sector": info.get("sector"),
            "ltp": ltp,
            "previous_close": prev,
            "point_change": round(ltp - prev, 2),
            "percentage_change": round(pct, 2),
            "volume": vol,
            "turnover": round(turnover, 2),
            "high": high,
            "low": low,
            "open_price": open_price,
        })

    if stocks_payload:
        res = await call_rpc(client, "sync_stocks", {"stock_data": stocks_payload})
        log.info(f"📊 Stocks synced: {res}")

    # ---------- Market summary ----------
    summary_dict = {}
    if isinstance(summary_raw, list):
        summary_dict = {item.get("detail", ""): item.get("value", "") for item in summary_raw}

    nepse_index_data = next((item for item in (indices_raw or []) if item.get("index") == "NEPSE Index"), None)
    nepse_index_val = float(nepse_index_data.get("currentValue", 0)) if nepse_index_data else 0.0
    nepse_point_change = float(nepse_index_data.get("change", 0)) if nepse_index_data else 0.0
    nepse_pct = float(nepse_index_data.get("perChange", 0)) if nepse_index_data else 0.0

    def parse_float(val) -> float:
        try:
            return float(str(val).replace(",", "").replace("Rs", "").replace(":", "").strip())
        except:
            return 0.0

    total_turnover = parse_float(summary_dict.get("Total Turnover Rs:", "0"))
    total_traded = parse_float(summary_dict.get("Total Traded Shares", "0"))
    total_txn = int(parse_float(summary_dict.get("Total Transactions", "0")))

    ms_payload = {
        "data": {
            "nepse_index": nepse_index_val,
            "percentage_change": round(nepse_pct, 2),
            "point_change": round(nepse_point_change, 2),
            "total_turnover": total_turnover,
            "total_traded_shares": int(total_traded),
            "total_transactions": total_txn,
            "market_status": "Open" if is_open else "Closed",
        }
    }
    res = await call_rpc(client, "sync_market_summary", ms_payload)
    log.info(f"📈 Market summary synced: {res}")

    # ---------- Sub-indices ----------
    sub_payload: List[dict] = []
    for item in (subindices_raw or []):
        sector = (item.get("index", "").replace(" SubIndex", "").replace(" Index", "")).strip()
        if not sector:
            continue
        value = float(item.get("currentValue", 0) or 0)
        change = float(item.get("change", 0) or 0)
        pct_change = float(item.get("percentChange", 0) or 0)
        sub_payload.append({
            "sector": sector,
            "value": round(value, 2),
            "change": round(change, 2),
            "percentage_change": round(pct_change, 2),
        })

    if sub_payload:
        res = await call_rpc(client, "sync_sub_indices", {"data": sub_payload})
        log.info(f"🏦 Sub-indices synced: {res}")


# ===========================================================================
# 2. Historical Prices
# ===========================================================================
async def fetch_and_sync_history(client: httpx.AsyncClient, symbols: Optional[List[str]] = None, limit: int = 20):
    """Fetch historical OHLCV for top stocks and push to InsForge."""
    from nepse import AsyncNepse

    if not symbols:
        # Fetch top symbols from InsForge
        resp = await client.get(
            f"{INSFORGE_BASE_URL}/api/database/records/stocks",
            headers=HEADERS,
            params={"order": "turnover.desc", "limit": str(limit), "select": "symbol"},
        )
        if resp.status_code == 200:
            symbols = [r["symbol"] for r in resp.json() if r.get("symbol")]
        else:
            log.error(f"Failed to get stock list: {resp.text[:200]}")
            return

    if not symbols:
        log.warning("No symbols to sync history for")
        return

    log.info(f"⏳ Fetching history for {len(symbols)} stocks...")
    n = AsyncNepse()
    n.setTLSVerification(False)

    all_history: List[dict] = []
    for sym in symbols:
        try:
            history = await n.getCompanyPriceVolumeHistory(sym)
            for item in (history or []):
                biz_date = item.get("businessDate")
                if not biz_date:
                    continue
                all_history.append({
                    "symbol": sym,
                    "date": biz_date,
                    "open": float(item.get("openPrice", 0) or item.get("closePrice", 0) or 0),
                    "high": float(item.get("highPrice", 0) or 0),
                    "low": float(item.get("lowPrice", 0) or 0),
                    "close": float(item.get("closePrice", 0) or 0),
                    "volume": int(item.get("totalTradedQuantity", 0) or 0),
                })
        except Exception as e:
            log.warning(f"  ⚠ History for {sym}: {e}")
        # Small delay to avoid rate limiting
        await asyncio.sleep(0.3)

    if all_history:
        # Batch in chunks of 500
        for i in range(0, len(all_history), 500):
            chunk = all_history[i : i + 500]
            res = await call_rpc(client, "sync_historical_prices", {"data": chunk})
            log.info(f"📅 Historical prices batch {i//500+1}: {res}")
    else:
        log.warning("No historical data retrieved")


# ===========================================================================
# 3. Real News Scraping  (ShareSansar)
# ===========================================================================
async def fetch_and_sync_news(client: httpx.AsyncClient):
    """Scrape real financial news from ShareSansar and push to InsForge."""
    log.info("⏳ Scraping news from ShareSansar...")

    news_items: List[dict] = []

    # -- Source 1: ShareSansar Latest News --
    urls = [
        ("https://www.sharesansar.com/news-page", "Market"),
        ("https://www.sharesansar.com/category/company-analysis", "Analysis"),
        ("https://www.sharesansar.com/category/mutual-fund", "Mutual Fund"),
    ]

    for url, category in urls:
        try:
            resp = await client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }, timeout=15, follow_redirects=True)
            if resp.status_code != 200:
                log.warning(f"  ShareSansar {category}: HTTP {resp.status_code}")
                continue

            soup = BeautifulSoup(resp.text, "lxml")

            # ShareSansar: grab article links from headings and featured lists
            articles = soup.select(".featured-news-list a, .media-heading a, h4 a, h3 a, h2 a")
            seen_titles = set()
            for a in articles:
                title = a.get_text(strip=True)
                href = a.get("href", "")
                if not title or len(title) < 15 or title in seen_titles:
                    continue
                seen_titles.add(title)
                # Clean up URL
                if href and not href.startswith("http"):
                    href = f"https://www.sharesansar.com{href}"

                news_items.append({
                    "title": title[:500],
                    "category": category,
                    "source": "ShareSansar",
                    "published_at": datetime.now().isoformat(),
                    "url": href,
                    "content": title,
                })
        except Exception as e:
            log.warning(f"  ShareSansar {category} error: {e}")

    # -- Source 2: MeroLagani News --
    try:
        resp = await client.get(
            "https://merolagani.com/NewsList.aspx",
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=15, follow_redirects=True,
        )
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "lxml")
            for a in soup.select("h4 a, .media-news a, .news-heading a"):
                title = a.get_text(strip=True)
                href = a.get("href", "")
                if title and len(title) > 10 and title not in {n["title"] for n in news_items}:
                    if href and not href.startswith("http"):
                        href = f"https://merolagani.com/{href.lstrip('/')}"
                    news_items.append({
                        "title": title[:500],
                        "category": "Market",
                        "source": "MeroLagani",
                        "published_at": datetime.now().isoformat(),
                        "url": href,
                        "content": title,
                    })
    except Exception as e:
        log.warning(f"  MeroLagani news error: {e}")

    if news_items:
        # Deduplicate
        seen = set()
        unique = []
        for n in news_items:
            if n["title"] not in seen:
                seen.add(n["title"])
                unique.append(n)
        res = await call_rpc(client, "sync_news", {"data": unique})
        log.info(f"📰 News synced ({len(unique)} articles): {res}")
    else:
        log.warning("No news articles scraped")


# ===========================================================================
# 4. Real IPO Data  (MeroLagani)
# ===========================================================================
async def fetch_and_sync_ipo(client: httpx.AsyncClient):
    """Scrape real IPO data from MeroLagani IPO page."""
    log.info("⏳ Scraping IPO data from MeroLagani...")

    ipo_items: List[dict] = []

    try:
        resp = await client.get(
            "https://merolagani.com/Ipo.aspx",
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"},
            timeout=15, follow_redirects=True,
        )
        if resp.status_code != 200:
            log.warning(f"MeroLagani IPO: HTTP {resp.status_code}")
            return

        soup = BeautifulSoup(resp.text, "lxml")

        # MeroLagani IPO page has tables with IPO data
        tables = soup.find_all("table")
        for table in tables:
            rows = table.find_all("tr")
            # Determine status from preceding header
            header = table.find_previous(["h2", "h3", "h4", "h5"])
            status = "UPCOMING"
            if header:
                header_text = header.get_text(strip=True).lower()
                if "open" in header_text or "ongoing" in header_text:
                    status = "OPEN"
                elif "close" in header_text or "past" in header_text or "result" in header_text:
                    status = "CLOSED"
                elif "upcoming" in header_text or "pipeline" in header_text:
                    status = "UPCOMING"

            for row in rows[1:]:  # Skip header row
                cells = row.find_all("td")
                if len(cells) < 3:
                    continue
                company_name = cells[0].get_text(strip=True)
                if not company_name or company_name.lower() in ("company", "name", "", "s.n."):
                    continue

                units = cells[1].get_text(strip=True) if len(cells) > 1 else ""
                opening_date = ""
                closing_date = ""

                # Try to extract dates from cells
                for cell in cells[2:]:
                    text = cell.get_text(strip=True)
                    # Look for date patterns
                    if "/" in text or "-" in text:
                        try:
                            # Try common date formats
                            for fmt in ["%Y/%m/%d", "%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y"]:
                                try:
                                    d = datetime.strptime(text.strip(), fmt)
                                    if not opening_date:
                                        opening_date = d.strftime("%Y-%m-%d")
                                    else:
                                        closing_date = d.strftime("%Y-%m-%d")
                                    break
                                except ValueError:
                                    continue
                        except:
                            pass

                ipo_items.append({
                    "company_name": company_name,
                    "sector": "Finance" if any(k in company_name.lower() for k in ["bank", "finance", "micro", "laghubitta"]) else "Others",
                    "units": units,
                    "status": status,
                    "opening_date": opening_date or None,
                    "closing_date": closing_date or None,
                })
    except Exception as e:
        log.warning(f"MeroLagani IPO scrape error: {e}")

    # Also try ShareSansar IPO page
    try:
        resp = await client.get(
            "https://www.sharesansar.com/category/ipo-fpo",
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=15, follow_redirects=True,
        )
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "lxml")
            # Look for IPO article titles that mention company names
            for a in soup.select(".featured-news-list a, .media-heading a, h4 a, h3 a"):
                title = a.get_text(strip=True)
                if title and ("IPO" in title or "FPO" in title or "Right Share" in title):
                    # Extract company name from title
                    company = title.split("IPO")[0].split("FPO")[0].strip().rstrip("'s").rstrip("'s").strip()
                    if company and len(company) > 3 and company not in {i["company_name"] for i in ipo_items}:
                        ipo_items.append({
                            "company_name": company,
                            "sector": "Others",
                            "units": "",
                            "status": "UPCOMING",
                            "opening_date": None,
                            "closing_date": None,
                        })
    except Exception as e:
        log.warning(f"ShareSansar IPO error: {e}")

    if ipo_items:
        res = await call_rpc(client, "sync_ipo", {"data": ipo_items})
        log.info(f"🏢 IPO synced ({len(ipo_items)} items): {res}")
    else:
        log.warning("No IPO data scraped")


# ===========================================================================
# Main orchestrator
# ===========================================================================
async def full_sync():
    """Run a complete sync of all data sources."""
    log.info("=" * 60)
    log.info("🚀 ShareSathi Full Sync — Starting")
    log.info("=" * 60)

    async with httpx.AsyncClient() as client:
        # 1) Market data + stock prices + sub-indices
        await fetch_and_sync_market(client)

        # 2) News from real sources
        await fetch_and_sync_news(client)

        # 3) IPO data
        await fetch_and_sync_ipo(client)

        # 4) Historical prices for top 15 stocks by turnover
        await fetch_and_sync_history(client, limit=15)

    log.info("=" * 60)
    log.info("✅ Full sync complete!")
    log.info("=" * 60)


async def prices_only():
    """Quick sync — stock prices + market summary only."""
    log.info("⚡ Quick price sync...")
    async with httpx.AsyncClient() as client:
        await fetch_and_sync_market(client)
    log.info("✅ Price sync done")


async def run_daemon():
    """Run the sync on a schedule."""
    log.info("🔄 Starting daemon mode...")
    log.info("   • Prices: every 2 minutes")
    log.info("   • News:   every 30 minutes")
    log.info("   • IPO:    every 6 hours")
    log.info("   • History: every 24 hours")

    last_news = datetime.min
    last_ipo = datetime.min
    last_history = datetime.min

    while True:
        now = datetime.now()
        try:
            # Always sync prices
            await prices_only()

            # News every 30 min
            if (now - last_news).total_seconds() > 1800:
                async with httpx.AsyncClient() as client:
                    await fetch_and_sync_news(client)
                last_news = now

            # IPO every 6 hours
            if (now - last_ipo).total_seconds() > 21600:
                async with httpx.AsyncClient() as client:
                    await fetch_and_sync_ipo(client)
                last_ipo = now

            # History once per day
            if (now - last_history).total_seconds() > 86400:
                async with httpx.AsyncClient() as client:
                    await fetch_and_sync_history(client, limit=15)
                last_history = now

        except Exception as e:
            log.error(f"Daemon loop error: {e}")

        log.info("💤 Sleeping 2 minutes...")
        await asyncio.sleep(120)


# ===========================================================================
# CLI entry-point
# ===========================================================================
if __name__ == "__main__":
    args = set(sys.argv[1:])

    if "--daemon" in args:
        try:
            asyncio.run(run_daemon())
        except KeyboardInterrupt:
            log.info("👋 Daemon stopped gracefully")
    elif "--prices" in args:
        asyncio.run(prices_only())
    elif "--news" in args:
        async def _news():
            async with httpx.AsyncClient() as c:
                await fetch_and_sync_news(c)
        asyncio.run(_news())
    elif "--ipo" in args:
        async def _ipo():
            async with httpx.AsyncClient() as c:
                await fetch_and_sync_ipo(c)
        asyncio.run(_ipo())
    elif "--history" in args:
        async def _hist():
            async with httpx.AsyncClient() as c:
                await fetch_and_sync_history(c, limit=15)
        asyncio.run(_hist())
    else:
        asyncio.run(full_sync())
