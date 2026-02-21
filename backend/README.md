# ShareSathi Backend

FastAPI backend for the ShareSathi paper trading platform. Handles trade execution, market data caching, WebSocket broadcasts, and NEPSE data synchronization.

## Architecture

```
app/
├── api/            # Route handlers (auth, stocks, trading, news, IPO, portfolio, watchlist)
├── services/       # Business logic
│   ├── trading_service.py   # Trade execution with NEPSE fee calculation
│   ├── nepse_service.py     # Live NEPSE API integration
│   ├── news_service.py      # Real news scraping (ShareSansar + MeroLagani)
│   ├── market_service.py    # Market data aggregation
│   └── portfolio_service.py # Portfolio management
├── models/         # SQLAlchemy ORM models (user, stock, transaction, portfolio, wallet)
├── repositories/   # Database query layer (async SQLAlchemy)
├── schemas/        # Pydantic request/response validation
├── cache/          # Redis caching with fakeredis dev fallback
├── background/     # APScheduler tasks (EOD market sync)
├── websocket/      # WebSocket connection manager (500 conn limit)
└── config.py       # Pydantic settings from env vars
```

## Key Services

### Trading (`trading_service.py`)
- NEPSE tiered brokerage: 0.36% (up to 50k) → 0.24% (10M+)
- SEBON regulation fee: 0.015%
- DP charge: Rs 25 per transaction
- 10-share minimum lot size
- Trading hours enforcement: Sun–Thu 11:00–15:00 NPT

### News (`news_service.py`)
- Live scraping from ShareSansar (3 category URLs) and MeroLagani
- 5-minute in-memory cache with stale fallback
- Dynamic category extraction

### Rate Limiting (`main.py`)
- Per-IP sliding window middleware
- Configurable via `RATE_LIMIT_PER_MINUTE` env var
- Skips health checks and WebSocket paths

## Setup

```bash
cp .env.example .env   # Fill in credentials
pip install -r requirements.txt
python -m pytest tests/ -v
python -m uvicorn app.main:app --reload --port 8000
```

## Data Sync

`sync_to_insforge.py` is a standalone daemon that pushes NEPSE data into InsForge:
- Stock prices: every 2 minutes
- News articles: every 30 minutes
- IPO listings: every 6 hours
- Historical OHLCV: every 24 hours

```bash
python sync_to_insforge.py
```

## Tests

```bash
python -m pytest tests/ -v
# 14 tests: brokerage fees, market hours, news, config, fee parity
```
