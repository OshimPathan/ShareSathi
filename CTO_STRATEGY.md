# ShareSathi — CTO Architecture & Startup Strategy Guide

> **Status**: Living document — last updated based on codebase audit of the deployed product at `https://vicia6je.insforge.site`  
> **Audience**: Founding team, engineering leads, investors  
> **Philosophy**: This is not a college project. Every decision below is weighed against a single question: _"Does this get us to 10,000 paying users in Nepal within 18 months?"_

---

## Table of Contents

1. [Product Architecture — The Big Picture](#1-product-architecture)
2. [Backend Architecture](#2-backend-architecture)
3. [Database Schema — Unified Design](#3-database-schema)
4. [Trading Simulation Engine](#4-trading-simulation-engine)
5. [Real-Time Market Data System](#5-real-time-market-data-system)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Landing Page Design](#7-landing-page-design)
8. [AI Prediction System](#8-ai-prediction-system)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Startup Roadmap (5 Stages)](#10-startup-roadmap)
11. [Monetization Strategy](#11-monetization-strategy)
12. [Critical Mistakes to Avoid](#12-critical-mistakes-to-avoid)

---

## 1. Product Architecture

### 1.1 Vision

ShareSathi = **the Robinhood of Nepal** — a paper trading + market intelligence platform for NEPSE. Users practice trading with virtual money, get AI-powered stock predictions, and learn to invest without financial risk. Revenue comes from premium analytics, AI subscriptions, and trading competitions.

### 1.2 System Architecture (End-to-End)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS (Web + PWA)                        │
│                   React 19 + Vite + Tailwind                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
                ┌───────────┴───────────┐
                │                       │
    ┌───────────▼──────────┐  ┌────────▼─────────┐
    │   InsForge BaaS      │  │  FastAPI Backend  │
    │   (Primary DB)       │  │  (Compute Layer)  │
    │                      │  │                   │
    │  • Auth (email/OAuth)│  │  • NEPSE scraper  │
    │  • PostgREST API     │  │  • AI prediction  │
    │  • RLS policies      │  │  • WebSocket hub  │
    │  • Storage (files)   │  │  • Background jobs│
    │  • Realtime WS       │  │  • Data pipeline  │
    └───────────┬──────────┘  └────────┬─────────┘
                │                       │
                │    ┌─────────────┐    │
                └────►  PostgreSQL  ◄───┘
                     │  (InsForge)  │
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │    Redis    │
                     │  (Cache +   │
                     │   Pub/Sub)  │
                     └─────────────┘
```

### 1.3 Current State — What's Built

| Subsystem | Status | Notes |
|-----------|--------|-------|
| Auth (email + OAuth) | ✅ Working | InsForge auth, Google/GitHub OAuth |
| Market data pipeline | ✅ Working | AsyncNepse scraper + InsForge sync |
| Paper trading engine | ✅ Working | NEPSE fee schedule, BUY/SELL, portfolio tracking |
| Credit-based practice | ✅ Working | Buy credits, spend on practice trades |
| AI predictions | ⚠️ Partial | ARIMA(5,1,0) works; LSTM, risk model, training = empty stubs |
| Subscription tiers | ✅ Working | Free/Basic/Pro with feature gates |
| Payment integration | ❌ Stub | Khalti/eSewa functions exist but do nothing |
| WebSocket realtime | ⚠️ Basic | Server exists, no client-side integration |
| News aggregation | ✅ Working | Scraped + synced to InsForge |
| Admin panel | ⚠️ Basic | Route exists, minimal functionality |
| CI/CD | ❌ Missing | No automated testing or deployment pipeline |

### 1.4 The Critical Architecture Decision

**Your #1 technical debt: dual-database split.**

Right now you have two separate database systems:
- **InsForge PostgreSQL** (frontend reads/writes directly via PostgREST) — auth, subscriptions, credits, practice trading, market data
- **SQLAlchemy backend** (FastAPI connects to its own DB) — paper trading, user wallets, portfolios, transactions

These two systems have **no shared user identity**. An InsForge auth user and a backend `users` table user are completely disconnected.

**Recommended Resolution — Consolidate on InsForge:**

| Approach | Effort | Risk | Recommendation |
|----------|--------|------|----------------|
| A) Move everything to InsForge | Medium | Low | **✅ Recommended for MVP** |
| B) Move everything to FastAPI | High | Medium | Better for complex business logic later |
| C) Keep both, sync user IDs | Ongoing | High | ❌ Don't do this |

**Why Option A wins for now:**
- InsForge gives you auth + database + storage + RLS for free
- Frontend already reads/writes InsForge directly — no API latency
- Your trading logic in `frontend/src/services/db/trading.ts` already uses InsForge RPC
- FastAPI backend becomes a **compute-only service** for: NEPSE scraping, AI inference, background sync, WebSocket broadcasting
- You don't maintain two databases, two user tables, two sessions

**Migration path:**
1. Create all backend tables (wallets, portfolios, transactions) as InsForge tables with RLS
2. Create PostgreSQL functions (`execute_trade`, `execute_sell`) for atomic operations
3. Frontend calls InsForge RPC for trades (you already partially do this)
4. Backend becomes stateless compute — scrapes NEPSE, runs AI, pushes data to InsForge via service role key

---

## 2. Backend Architecture

### 2.1 Current Structure

```
backend/app/
├── main.py                    # FastAPI app + middleware
├── config.py                  # Pydantic settings (env-based)
├── dependencies.py            # DI for DB sessions
├── api/                       # Route handlers
│   ├── router.py             # Central router
│   ├── auth.py, market.py    # Domain routes
│   ├── trading.py, portfolio.py
│   └── stocks.py, watchlist.py, ipo.py, news.py, ai.py
├── services/                  # Business logic
│   ├── nepse_service.py      # NEPSE API scraper (AsyncNepse)
│   ├── trading_service.py    # BUY/SELL engine
│   ├── market_service.py     # Market data aggregation
│   └── portfolio_service.py, ai_service.py, ...
├── models/                    # SQLAlchemy ORM models
├── repositories/              # Data access layer
├── schemas/                   # Pydantic request/response schemas
├── cache/                     # Redis caching layer
├── background/                # APScheduler jobs
├── websocket/                 # WebSocket connection manager
├── ai/                        # ML models (ARIMA, LSTM stubs)
└── core/                      # Auth, JWT, security utils
```

### 2.2 What to Fix

#### P0: Hardcoded SECRET_KEY
```python
# backend/app/config.py line 10
SECRET_KEY: str = "dev-secret-change-in-production-min-32-chars!!"
```
You have a `validate_production()` guard, which is good. But:
- Generate a real key: `python -c "import secrets; print(secrets.token_urlsafe(64))"`
- Set `SECRET_KEY` env var in your deployment platform
- Set `ENVIRONMENT=production` in your deployment

#### P0: In-Memory Rate Limiter Won't Scale
```python
# backend/app/main.py — RateLimitMiddleware uses defaultdict
self._hits: dict[str, list[float]] = defaultdict(list)
```
This works for a single process. With multiple workers (uvicorn --workers 4), each has its own dict.

**Fix**: Move to Redis-backed rate limiting:
```python
# Use redis sliding window
async def check_rate_limit(redis, client_ip: str, limit: int, window: int) -> bool:
    key = f"ratelimit:{client_ip}"
    pipe = redis.pipeline()
    now = time.time()
    pipe.zremrangebyscore(key, 0, now - window)
    pipe.zadd(key, {str(now): now})
    pipe.zcard(key)
    pipe.expire(key, window)
    results = await pipe.execute()
    return results[2] <= limit
```

#### P1: Backend Role in Unified Architecture

Once you consolidate on InsForge, the backend's responsibilities shrink to:

```
FastAPI Backend (Compute Layer)
├── /api/v1/market/*        → Proxy/cache NEPSE data, push to InsForge
├── /api/v1/ai/predict      → Run ARIMA/LSTM inference
├── /ws                     → WebSocket broadcast of market data
├── /health                 → Health check
└── Background Jobs:
    ├── sync_eod_market_data    (15:15 Sun-Thu)
    ├── sync_historical_data    (00:00 daily)
    └── train_ai_models         (weekly)
```

Everything else (auth, trading, portfolio, watchlist, subscriptions) lives in InsForge with RLS policies.

### 2.3 Recommended Backend Structure (Post-Unification)

```
backend/app/
├── main.py
├── config.py
├── api/
│   ├── market.py         # GET /market/* — cached NEPSE data
│   ├── ai.py             # POST /predict — ML inference
│   └── health.py         # GET /health
├── services/
│   ├── nepse_service.py  # AsyncNepse scraper
│   ├── ai_service.py     # Model loading + inference
│   └── sync_service.py   # Push data to InsForge tables
├── ai/
│   ├── inference/
│   │   └── predict.py    # ARIMA + LSTM inference
│   ├── training/
│   │   └── train.py      # Model training pipeline
│   └── models/           # Saved model weights (.pkl, .h5)
├── background/
│   ├── scheduler.py      # APScheduler setup
│   ├── market_sync.py    # EOD sync job
│   └── historical_sync.py
├── cache/
│   ├── redis_client.py
│   └── cache_service.py
└── websocket/
    ├── market_ws.py
    └── connection_manager.py
```

### 2.4 Environment Configuration

```bash
# .env (production)
ENVIRONMENT=production
SECRET_KEY=<64-char-random-string>
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/sharesathi
REDIS_URL=redis://:password@host:6379/0
INSFORGE_URL=https://vicia6je.us-east.insforge.app
INSFORGE_SERVICE_KEY=<service-role-key>  # For backend→InsForge writes
SENTRY_DSN=https://xxx@sentry.io/xxx
ALLOWED_ORIGINS=https://sharesathi.com,https://vicia6je.insforge.site
```

---

## 3. Database Schema

### 3.1 Unified Schema (InsForge PostgreSQL)

All tables should live in InsForge with Row Level Security (RLS). The backend writes using a **service role key** (bypasses RLS). The frontend reads/writes using the **anon key** (subject to RLS).

#### Core Tables

```sql
-- ═══════════════════════════════════════════
-- USERS (managed by InsForge Auth — auth.users)
-- No separate users table needed.
-- user_id = auth.uid() everywhere.
-- ═══════════════════════════════════════════

-- ─── User Profile (extends auth.users) ───
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN DEFAULT false,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles readable" ON profiles FOR SELECT USING (is_public = true);

-- ─── Wallets ───
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC(15,2) NOT NULL DEFAULT 1000000.00,  -- Rs. 10 lakh starting
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON wallets FOR ALL USING (true);  -- backend service key

-- ─── Portfolio (holdings) ───
CREATE TABLE public.portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  average_buy_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, symbol)
);

ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own portfolio" ON portfolio FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public portfolios" ON portfolio FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = user_id AND is_public = true));

-- ─── Transactions (trade history) ───
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL')),
  quantity INTEGER NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  fees NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);

-- ─── Watchlist ───
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  alert_above NUMERIC(12,2),
  alert_below NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, symbol)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own watchlist" ON watchlist FOR ALL USING (auth.uid() = user_id);
```

#### Market Data Tables (Public, Read-Only for Users)

```sql
-- ─── Stocks (synced by backend) ───
CREATE TABLE public.stocks (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT,
  sector TEXT,
  ltp NUMERIC(12,2),         -- Last traded price
  change NUMERIC(8,2),
  percent_change NUMERIC(6,2),
  volume BIGINT,
  turnover NUMERIC(15,2),
  high NUMERIC(12,2),
  low NUMERIC(12,2),
  open NUMERIC(12,2),
  previous_close NUMERIC(12,2),
  market_cap NUMERIC(18,2),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Market Summary ───
CREATE TABLE public.market_summary (
  id INTEGER PRIMARY KEY DEFAULT 1,
  nepse_index NUMERIC(10,2),
  change NUMERIC(8,2),
  percent_change NUMERIC(6,2),
  turnover NUMERIC(18,2),
  traded_shares BIGINT,
  total_transactions INTEGER,
  is_open BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Historical Prices ───
CREATE TABLE public.historical_prices (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  date DATE NOT NULL,
  open NUMERIC(12,2),
  high NUMERIC(12,2),
  low NUMERIC(12,2),
  close NUMERIC(12,2),
  volume BIGINT,
  UNIQUE(symbol, date)
);

CREATE INDEX idx_historical_symbol_date ON historical_prices(symbol, date DESC);

-- ─── Sub-Indices ───
CREATE TABLE public.sub_indices (
  id SERIAL PRIMARY KEY,
  sector TEXT NOT NULL UNIQUE,
  value NUMERIC(10,2),
  change NUMERIC(8,2),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── News ───
CREATE TABLE public.news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT,
  url TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── IPO ───
CREATE TABLE public.ipo (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  symbol TEXT,
  shares_offered BIGINT,
  price_per_share NUMERIC(10,2),
  open_date DATE,
  close_date DATE,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Monetization Tables

```sql
-- ─── Subscriptions ───
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ─── Credit System (practice trading) ───
CREATE TABLE public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_npr NUMERIC(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'reward', 'refund')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.2 Atomic Trade Execution (PostgreSQL Function)

This is the most critical piece. Trades MUST be atomic — balance check + debit + portfolio update + transaction log in a single database transaction.

```sql
CREATE OR REPLACE FUNCTION execute_trade(
  p_user_id UUID,
  p_symbol TEXT,
  p_action TEXT,      -- 'BUY' or 'SELL'
  p_quantity INTEGER,
  p_price NUMERIC,
  p_fees NUMERIC
) RETURNS JSONB AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_portfolio portfolio%ROWTYPE;
  v_trade_amount NUMERIC;
  v_total NUMERIC;
  v_net_revenue NUMERIC;
  v_new_avg NUMERIC;
BEGIN
  -- Validate inputs
  IF p_quantity < 10 THEN
    RETURN jsonb_build_object('error', 'Minimum order size is 10 shares (NEPSE lot size)');
  END IF;

  v_trade_amount := p_price * p_quantity;

  -- Lock wallet row
  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Wallet not found');
  END IF;

  IF p_action = 'BUY' THEN
    v_total := v_trade_amount + p_fees;

    IF v_wallet.balance < v_total THEN
      RETURN jsonb_build_object('error',
        format('Insufficient balance. Need Rs. %s but have Rs. %s', v_total, v_wallet.balance));
    END IF;

    -- Debit wallet
    UPDATE wallets SET balance = balance - v_total, updated_at = now()
      WHERE user_id = p_user_id;

    -- Upsert portfolio
    SELECT * INTO v_portfolio FROM portfolio
      WHERE user_id = p_user_id AND symbol = p_symbol FOR UPDATE;

    IF FOUND THEN
      v_new_avg := ((v_portfolio.quantity * v_portfolio.average_buy_price) + v_trade_amount)
                   / (v_portfolio.quantity + p_quantity);
      UPDATE portfolio
        SET quantity = quantity + p_quantity,
            average_buy_price = v_new_avg,
            updated_at = now()
        WHERE user_id = p_user_id AND symbol = p_symbol;
    ELSE
      INSERT INTO portfolio (user_id, symbol, quantity, average_buy_price)
        VALUES (p_user_id, p_symbol, p_quantity, p_price);
    END IF;

    -- Log transaction
    INSERT INTO transactions (user_id, symbol, action, quantity, price, fees, total)
      VALUES (p_user_id, p_symbol, 'BUY', p_quantity, p_price, p_fees, v_total);

  ELSIF p_action = 'SELL' THEN
    v_net_revenue := v_trade_amount - p_fees;

    -- Check holdings
    SELECT * INTO v_portfolio FROM portfolio
      WHERE user_id = p_user_id AND symbol = p_symbol FOR UPDATE;

    IF NOT FOUND OR v_portfolio.quantity < p_quantity THEN
      RETURN jsonb_build_object('error', 'Insufficient shares to sell');
    END IF;

    -- Credit wallet
    UPDATE wallets SET balance = balance + v_net_revenue, updated_at = now()
      WHERE user_id = p_user_id;

    -- Update or delete portfolio
    IF v_portfolio.quantity = p_quantity THEN
      DELETE FROM portfolio WHERE user_id = p_user_id AND symbol = p_symbol;
    ELSE
      UPDATE portfolio SET quantity = quantity - p_quantity, updated_at = now()
        WHERE user_id = p_user_id AND symbol = p_symbol;
    END IF;

    -- Log transaction
    INSERT INTO transactions (user_id, symbol, action, quantity, price, fees, total)
      VALUES (p_user_id, p_symbol, 'SELL', p_quantity, p_price, p_fees, v_net_revenue);

  ELSE
    RETURN jsonb_build_object('error', 'Invalid action. Use BUY or SELL.');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'action', p_action,
    'symbol', p_symbol,
    'quantity', p_quantity,
    'price', p_price,
    'fees', p_fees
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. Trading Simulation Engine

### 4.1 Current Implementation

Your trading engine exists in **two places** (this is the dual-database problem):

| Location | What it does |
|----------|-------------|
| `backend/app/services/trading_service.py` | Full BUY/SELL with SQLAlchemy ORM, fee calculation, market hours check |
| `frontend/src/services/db/trading.ts` | Fee estimation + InsForge RPC call to `execute_trade` |

### 4.2 Target Architecture

```
User clicks "Buy 100 NABIL"
        │
        ▼
┌─── Frontend ──────────────────┐
│ 1. estimateFees(price * qty)  │  ← Client-side preview only
│ 2. Show confirmation modal    │
│ 3. Call InsForge RPC:         │
│    execute_trade(             │
│      user_id, symbol,         │
│      'BUY', 100, price, fees  │
│    )                          │
└───────────┬───────────────────┘
            │ PostgREST RPC
            ▼
┌─── InsForge PostgreSQL ───────┐
│ execute_trade() function      │
│ (SECURITY DEFINER)            │
│                               │
│ 1. Lock wallet row (FOR UPD.) │
│ 2. Check balance ≥ total_cost │
│ 3. Debit wallet               │
│ 4. Upsert portfolio           │
│ 5. Insert transaction log     │
│ 6. COMMIT (atomic)            │
│ 7. Return {success: true}     │
└───────────────────────────────┘
```

### 4.3 NEPSE Fee Schedule

Your implementation correctly mirrors NEPSE's tiered brokerage:

| Trade Amount | Brokerage Rate |
|-------------|---------------|
| Up to Rs. 50,000 | 0.36% |
| Rs. 50,001 - 5,00,000 | 0.33% |
| Rs. 5,00,001 - 20,00,000 | 0.31% |
| Rs. 20,00,001 - 1,00,00,000 | 0.27% |
| Above Rs. 1,00,00,000 | 0.24% |

Plus:
- SEBON fee: 0.015%
- DP charge: Rs. 25 per transaction

**Keep this calculation in BOTH frontend (for preview) and the PostgreSQL function (for enforcement).**

### 4.4 Business Rules to Implement

```
Trading Rules:
├── Minimum lot size: 10 shares (NEPSE rule, already enforced)
├── Market hours: Sun-Thu 11:00-15:00 NPT
│   └── For paper trading: ALLOW after hours but show warning
├── Daily trade limit: Based on subscription tier
│   ├── Free: 5 trades/day
│   ├── Basic: 20 trades/day
│   └── Pro: Unlimited
├── Circuit breaker: ±10% daily price movement (NEPSE rule)
│   └── Reject trades at prices outside circuit limits
├── Settlement: T+2 in real NEPSE — for paper trading, instant
└── Short selling: NOT allowed (NEPSE doesn't support it)
```

### 4.5 Leaderboard System

Track trading performance for social features and competitions:

```sql
CREATE VIEW public.leaderboard AS
SELECT
  p.id AS user_id,
  p.display_name,
  p.avatar_url,
  w.balance AS current_balance,
  w.balance - 1000000.00 AS profit_loss,
  ROUND(((w.balance - 1000000.00) / 1000000.00) * 100, 2) AS return_pct,
  (SELECT COUNT(*) FROM transactions t WHERE t.user_id = p.id) AS total_trades,
  RANK() OVER (ORDER BY w.balance DESC) AS rank
FROM profiles p
JOIN wallets w ON w.user_id = p.id
WHERE p.is_public = true
ORDER BY w.balance DESC
LIMIT 100;
```

---

## 5. Real-Time Market Data System

### 5.1 Data Flow

```
NEPSE (merolagani, sharesansar, nepalipaisa)
        │
        ▼  Scrape every 30s during market hours
┌─── FastAPI Backend ────────────┐
│ NepseService.get_live_market() │
│       │                        │
│       ├─→ Redis cache (TTL 30s)│
│       ├─→ InsForge upsert      │
│       └─→ WebSocket broadcast  │
└────────────────────────────────┘
        │
        ├──→ Frontend polls InsForge (every 60s)
        └──→ WebSocket push (real-time, < 1s)
```

### 5.2 Current Implementation

Your `NepseService` already does this well:

```python
# backend/app/services/nepse_service.py
class NepseService:
    @classmethod
    async def get_market_summary(cls):
        cached = await get_cached_market_summary()  # Redis first
        if cached: return cached
        # Scrape from AsyncNepse
        summary, indices, subindices, gainers, losers, turnovers, is_open = await asyncio.gather(...)
        await set_cached_market_summary(result)  # Cache for 30s
        return result
```

### 5.3 What to Upgrade

#### A) Add WebSocket Client Integration

Your WebSocket server exists but the frontend doesn't connect to it:

```typescript
// frontend/src/services/websocket.ts — NEW FILE
class MarketWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(token?: string) {
    const url = `${import.meta.env.VITE_WS_URL || 'wss://your-backend.com'}/ws${token ? `?token=${token}` : ''}`;
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const handlers = this.listeners.get(msg.type);
      handlers?.forEach(fn => fn(msg.data));
    };

    this.ws.onclose = () => {
      this.reconnectTimer = setTimeout(() => this.connect(token), 5000);
    };
  }

  on(event: string, handler: (data: any) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}

export const marketWS = new MarketWebSocket();
```

#### B) Backend: Broadcast Market Updates

```python
# backend/app/background/market_sync.py — upgrade
async def sync_live_market():
    """Called every 30s during market hours."""
    data = await NepseService.get_live_market()

    # 1. Cache in Redis
    await set_cached_live_market(data)

    # 2. Push to InsForge (so frontend can also poll)
    await sync_to_insforge(data)

    # 3. Broadcast to WebSocket clients
    await manager.broadcast(json.dumps({
        "type": "market_update",
        "data": {
            "nepse_index": data["nepse_index"],
            "change": data["change"],
            "turnover": data["turnover"],
            "timestamp": datetime.now().isoformat()
        }
    }))
```

#### C) Add Aggressive Caching Layers

```
Request Flow for Market Data:
User → Frontend
  → Check React Query / Zustand cache (< 1s)
  → Miss: Call InsForge (PostgREST)
    → Miss: Backend API
      → Check Redis (TTL 30s)
        → Miss: Scrape NEPSE
          → Cache in Redis + InsForge
          → Return
```

**Recommended cache TTLs:**

| Data | TTL | Reasoning |
|------|-----|-----------|
| Market summary | 30s | Changes every trade |
| Stock prices | 30s | LTP updates continuously |
| Sub-indices | 60s | Changes less frequently |
| News | 5 min | New articles every few hours |
| Historical prices | 24h | Only updates EOD |
| Company fundamentals | 1h | Rarely changes |

### 5.4 InsForge Realtime (Alternative to Custom WebSocket)

InsForge has built-in realtime capabilities. You could subscribe to database changes:

```typescript
// Subscribe to stocks table changes
const channel = insforge.realtime
  .channel('market-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'market_summary'
  }, (payload) => {
    // Update UI with new market data
    setMarketSummary(payload.new);
  })
  .subscribe();
```

This means your backend just needs to UPSERT rows into InsForge, and connected clients automatically get the updates.

---

## 6. Frontend Architecture

### 6.1 Current Stack

| Tech | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| Vite | 7 | Build tool, HMR |
| TypeScript | 5.9 | Type safety |
| Tailwind CSS | 4 | Styling |
| Zustand | 5 | State management |
| React Router DOM | 7 | Routing |
| Recharts | 2.x | Charts/analytics |
| Lightweight Charts | 4.x | Candlestick/OHLC charts |
| @insforge/sdk | ^1.1.5 | Backend-as-a-Service |
| Lucide React | — | Icons |
| react-helmet-async | — | SEO meta tags |

### 6.2 Component Architecture

```
src/
├── App.tsx                    # Route definitions (26+ routes)
├── main.tsx                   # Entry point
├── lib/
│   └── insforge.ts           # SDK client singleton
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx     # Sidebar + top bar
│   │   ├── ProtectedRoute.tsx # Auth guard
│   │   ├── Navbar.tsx        # Public navigation
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── ErrorBoundary.tsx
│   │   ├── Skeleton.tsx      # Loading states
│   │   └── ...
│   ├── dashboard/            # Dashboard widgets
│   ├── stock/                # Stock detail components
│   ├── trading/              # Trade execution UI
│   ├── portfolio/            # Holdings display
│   └── landing/              # Landing page sections
├── pages/                     # Route-level components
│   ├── Landing.tsx           # Public homepage
│   ├── Dashboard/index.tsx   # Authenticated dashboard
│   ├── Auth/Login.tsx        # Login/Register/ForgotPassword
│   ├── StockDetail.tsx       # Individual stock view
│   ├── Trading.tsx           # Trade execution page
│   ├── Portfolio.tsx         # Holdings overview
│   ├── Watchlist.tsx         # Watchlist management
│   ├── PracticeTrading.tsx   # Credit-based practice
│   └── ... (20+ more pages)
├── services/db/               # InsForge data layer
│   ├── market.ts             # Market data queries
│   ├── trading.ts            # Trade execution
│   ├── wallet.ts             # Wallet management
│   ├── portfolio.ts          # Portfolio queries
│   ├── watchlist.ts          # Watchlist CRUD
│   ├── leaderboard.ts        # Leaderboard data
│   └── credits.ts            # Credit system
├── store/                     # Zustand stores
│   ├── authStore.ts          # Auth state + actions
│   ├── subscriptionStore.ts  # Plan + feature gates
│   ├── creditStore.ts        # Credit balance
│   ├── themeStore.ts         # Dark/light mode
│   ├── notificationStore.ts  # Toast notifications
│   └── i18nStore.ts          # Language (EN/NE)
├── types/                     # TypeScript interfaces
├── i18n/                      # Translation files
└── utils/                     # Formatters, helpers
```

### 6.3 Key Patterns

**Data fetching**: Direct InsForge SDK calls from service files. No React Query or SWR yet.

**State management**: Zustand with persist middleware for auth, theme, i18n.

**Code splitting**: Lazy loading via `React.lazy()` for all pages except Landing and Login (eager for fast first paint).

**Auth flow**: 
```
User → Login.tsx → insforge.auth.signIn() → authStore.login() 
  → ProtectedRoute checks session → Dashboard loads
```

### 6.4 What to Upgrade

#### P0: Add React Query for Data Fetching

Right now every component manually calls InsForge and manages loading/error states. React Query gives you caching, deduplication, background refetch, and stale-while-revalidate for free.

```bash
npm install @tanstack/react-query
```

```typescript
// src/hooks/useMarketData.ts
import { useQuery } from '@tanstack/react-query';
import { getMarketSummary, getAllStocks, getSubIndices } from '../services/db/market';

export function useMarketSummary() {
  return useQuery({
    queryKey: ['market-summary'],
    queryFn: getMarketSummary,
    staleTime: 30_000,      // 30s — matches backend cache
    refetchInterval: 60_000, // Auto-refresh every 60s
  });
}

export function useStocks() {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: getAllStocks,
    staleTime: 30_000,
  });
}
```

#### P1: Optimistic Mutations for Trading

```typescript
// src/hooks/useTrade.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executeTrade } from '../services/db/trading';

export function useTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ symbol, quantity, action }: TradeParams) =>
      executeTrade(symbol, quantity, action),
    onSuccess: () => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

#### P2: Tailwind CSS Version

Your `package.json` has Tailwind v4, but AGENTS.md says to use v3.4. Upgrading to v4 is fine as long as:
- You've migrated `tailwind.config.js` to the new CSS-based config format
- You're not using any v3 plugins that don't support v4

If you start seeing styling issues, pin to `"tailwindcss": "^3.4.0"`.

---

## 7. Landing Page Design

### 7.1 Structure

Your landing page should convert visitors into registered users. Here's the information architecture:

```
┌──────────────────────────────────────────────┐
│ NAVBAR                                        │
│ Logo | Market | News | IPO | Learn | [Login]  │
├──────────────────────────────────────────────┤
│ HERO SECTION                                  │
│ "Master NEPSE Trading —                       │
│  Without Risking a Single Rupee"              │
│                                               │
│ [Start Trading Free]  [View Live Market]      │
│                                               │
│ Live ticker: NEPSE ▲2712.49 (+0.8%)          │
├──────────────────────────────────────────────┤
│ LIVE MARKET OVERVIEW                          │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │NEPSE│ │Vol  │ │Turn │ │Trans│              │
│ │2712 │ │23M  │ │8.2B │ │45K  │              │
│ └─────┘ └─────┘ └─────┘ └─────┘              │
│                                               │
│ Top Gainers        Top Losers                 │
│ NABIL ▲5.2%       HBL ▼-3.1%                │
│ NICA  ▲4.8%       SBILN ▼-2.5%              │
├──────────────────────────────────────────────┤
│ FEATURES (3 cards)                            │
│ 📊 Paper Trading    🤖 AI Predictions        │
│ Practice with Rs.   ARIMA/LSTM models         │
│ 10L virtual cash    forecast stock prices     │
│                                               │
│ 📰 Market Intel     🏆 Competitions          │
│ Real-time news,     Compete with traders      │
│ IPO alerts, sector  on the leaderboard        │
│ analysis                                      │
├──────────────────────────────────────────────┤
│ SOCIAL PROOF                                  │
│ "10,000+ traders trust ShareSathi"            │
│ User testimonials / trading stats             │
├──────────────────────────────────────────────┤
│ PRICING                                       │
│ Free | Basic (Rs.299) | Pro (Rs.799)          │
├──────────────────────────────────────────────┤
│ CTA                                           │
│ "Ready to Start?" [Create Free Account]       │
├──────────────────────────────────────────────┤
│ FOOTER                                        │
│ Links | Legal | Social | Contact              │
└──────────────────────────────────────────────┘
```

### 7.2 SEO Essentials

You already have `react-helmet-async`. Make sure every page has:

```tsx
<Helmet>
  <title>ShareSathi — NEPSE Paper Trading & AI Stock Predictions</title>
  <meta name="description" content="Practice NEPSE stock trading risk-free with Rs. 10 lakh virtual cash. AI-powered predictions, real-time market data, and trading competitions." />
  <meta property="og:title" content="ShareSathi — Master NEPSE Trading" />
  <meta property="og:image" content="/og-image.png" />
  <link rel="canonical" href="https://sharesathi.com" />
</Helmet>
```

### 7.3 Performance Budget

| Metric | Target | Why |
|--------|--------|-----|
| LCP (Largest Contentful Paint) | < 2.5s | Google ranking factor |
| FID (First Input Delay) | < 100ms | Interactivity |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability |
| Bundle size (initial) | < 200KB gzipped | Nepal internet speeds are variable |

**Actions:**
- Landing and Login are already eagerly loaded (good)
- All other pages use `React.lazy()` (good)
- Add `<link rel="preconnect" href="https://vicia6je.us-east.insforge.app">` to `index.html`
- Compress images with WebP format
- Consider using `@vercel/analytics` for Core Web Vitals tracking

---

## 8. AI Prediction System

### 8.1 Current State

| Component | File | Status |
|-----------|------|--------|
| ARIMA(5,1,0) inference | `backend/app/ai/inference/predict.py` | ✅ Working |
| LSTM model | `backend/app/ai/inference/lstm_predict.py` | ❌ Empty (0 bytes) |
| Risk model | `backend/app/ai/inference/risk_model.py` | ❌ Empty (0 bytes) |
| Training pipeline | `backend/app/ai/training/train.py` | ❌ Empty (0 bytes) |
| Evaluation | `backend/app/ai/training/evaluate.py` | ❌ Empty (0 bytes) |

### 8.2 ARIMA — What You Have

```python
# backend/app/ai/inference/predict.py
def run_prediction(symbol, historical_data):
    closes = [day["close"] for day in history]
    model = ARIMA(closes, order=(5,1,0))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=7)
    # Returns 7-day forecast + risk classification + volatility
```

**Strengths:** Simple, fast, works with small datasets (30+ data points).

**Weaknesses:** 
- ARIMA is a linear model — can't capture complex patterns
- `ai_confidence_score` is hardcoded at 0.85 (dishonest)
- No model persistence (re-fits every request)
- No backtesting to validate accuracy

### 8.3 Upgrade Path: ARIMA → LSTM → Ensemble

#### Phase 1: Fix ARIMA (Week 1-2)

```python
# backend/app/ai/inference/predict.py — improvements
import pickle
from pathlib import Path

MODEL_DIR = Path(__file__).parent.parent / "models"

def run_prediction(symbol: str, historical_data: dict) -> dict:
    closes = [day["close"] for day in historical_data["history"]]

    if len(closes) < 30:
        return {"error": "Need at least 30 days of data"}

    # Try loading cached model first
    model_path = MODEL_DIR / f"arima_{symbol.lower()}.pkl"
    if model_path.exists():
        with open(model_path, "rb") as f:
            model_fit = pickle.load(f)
        # Update with new data
        model_fit = model_fit.append(closes[-7:], refit=False)
    else:
        model = ARIMA(closes, order=(5,1,0))
        model_fit = model.fit()
        # Save model
        MODEL_DIR.mkdir(exist_ok=True)
        with open(model_path, "wb") as f:
            pickle.dump(model_fit, f)

    forecast = model_fit.forecast(steps=7)

    # REAL confidence score based on historical accuracy
    confidence = calculate_confidence(closes, model_fit)

    return {
        "symbol": symbol.upper(),
        "7_day_forecast": format_forecast(forecast),
        "risk_classification": classify_risk(closes),
        "volatility_percentage": calculate_volatility(closes),
        "ai_confidence_score": confidence,  # REAL score
        "model_used": "ARIMA(5,1,0)"
    }

def calculate_confidence(closes: list, model_fit) -> float:
    """Backtest: how accurate was the model on the last 7 days?"""
    if len(closes) < 37:
        return 0.5  # Not enough data
    train = closes[:-7]
    actual = closes[-7:]
    backtest_model = ARIMA(train, order=(5,1,0)).fit()
    predicted = backtest_model.forecast(steps=7)
    mape = np.mean(np.abs((np.array(actual) - predicted) / np.array(actual)))
    return round(max(0, min(1, 1 - mape)), 2)
```

#### Phase 2: Add LSTM (Month 2-3)

```python
# backend/app/ai/inference/lstm_predict.py
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler

class LSTMPredictor:
    def __init__(self, model_path: str = None):
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model = None
        self.lookback = 60  # 60-day window

        if model_path:
            self.model = tf.keras.models.load_model(model_path)

    def build_model(self) -> tf.keras.Model:
        model = tf.keras.Sequential([
            tf.keras.layers.LSTM(50, return_sequences=True, input_shape=(self.lookback, 1)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.LSTM(50, return_sequences=False),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(25),
            tf.keras.layers.Dense(7)  # 7-day forecast
        ])
        model.compile(optimizer='adam', loss='mean_squared_error')
        return model

    def train(self, closes: list[float], epochs: int = 50):
        data = np.array(closes).reshape(-1, 1)
        scaled = self.scaler.fit_transform(data)

        X, y = [], []
        for i in range(self.lookback, len(scaled) - 7):
            X.append(scaled[i - self.lookback:i, 0])
            y.append(scaled[i:i + 7, 0])

        X = np.array(X).reshape(-1, self.lookback, 1)
        y = np.array(y)

        self.model = self.build_model()
        self.model.fit(X, y, batch_size=32, epochs=epochs, validation_split=0.1, verbose=0)

    def predict(self, closes: list[float]) -> list[float]:
        if not self.model:
            raise ValueError("Model not trained")
        data = np.array(closes[-self.lookback:]).reshape(-1, 1)
        scaled = self.scaler.transform(data).reshape(1, self.lookback, 1)
        predicted_scaled = self.model.predict(scaled, verbose=0)[0]
        predicted = self.scaler.inverse_transform(predicted_scaled.reshape(-1, 1))
        return predicted.flatten().tolist()
```

#### Phase 3: Training Pipeline (Month 2-3)

```python
# backend/app/ai/training/train.py
import asyncio
from datetime import datetime
from pathlib import Path
from app.services.nepse_service import NepseService
from app.ai.inference.lstm_predict import LSTMPredictor

MODEL_DIR = Path(__file__).parent.parent / "models"

async def train_all_models():
    """Weekly training job — called by scheduler."""
    symbols = await get_high_volume_symbols(min_days=120)

    for symbol in symbols:
        history = await fetch_historical_prices(symbol, days=365)
        closes = [h["close"] for h in history]

        if len(closes) < 120:
            continue

        # Train LSTM
        predictor = LSTMPredictor()
        predictor.train(closes, epochs=50)

        model_path = MODEL_DIR / f"lstm_{symbol.lower()}.h5"
        predictor.model.save(model_path)

        # Evaluate
        train_closes = closes[:-7]
        actual = closes[-7:]
        predictor_eval = LSTMPredictor()
        predictor_eval.train(train_closes, epochs=50)
        predicted = predictor_eval.predict(train_closes)

        mape = np.mean(np.abs((np.array(actual) - np.array(predicted)) / np.array(actual)))
        print(f"{symbol}: MAPE = {mape:.4f}")
```

#### Phase 4: Ensemble Model (Month 4+)

```python
def ensemble_predict(symbol: str, closes: list[float]) -> dict:
    """Combine ARIMA + LSTM forecasts with weighted average."""

    arima_forecast = arima_predict(closes)
    lstm_forecast = lstm_predict(closes)

    # Weight by historical accuracy (from backtest)
    arima_weight = 0.4  # Update based on backtesting
    lstm_weight = 0.6

    ensemble = [
        arima_weight * a + lstm_weight * l
        for a, l in zip(arima_forecast, lstm_forecast)
    ]

    return {
        "ensemble_forecast": ensemble,
        "arima_forecast": arima_forecast,
        "lstm_forecast": lstm_forecast,
        "weights": {"arima": arima_weight, "lstm": lstm_weight}
    }
```

### 8.4 Prediction API

```python
# backend/app/api/ai.py
@router.get("/predict/{symbol}")
async def predict_stock(symbol: str, db: AsyncSession = Depends(get_db)):
    # Get historical data
    history = await get_historical_prices(db, symbol, days=365)

    # Try LSTM first (more accurate), fall back to ARIMA
    lstm_path = MODEL_DIR / f"lstm_{symbol.lower()}.h5"
    if lstm_path.exists():
        predictor = LSTMPredictor(str(lstm_path))
        closes = [h.close for h in history]
        forecast = predictor.predict(closes)
        model_used = "LSTM"
    else:
        result = run_prediction(symbol, {"history": [...]})
        return result

    return {
        "symbol": symbol,
        "7_day_forecast": format_forecast(forecast),
        "model_used": model_used,
        "confidence": calculate_backtest_confidence(closes, forecast),
        "disclaimer": "AI predictions are for educational purposes only. Not financial advice."
    }
```

### 8.5 Critical: Disclaimers

**NEVER** present AI predictions without disclaimers. Nepal's securities regulator (SEBON) can flag you. Every prediction response must include:

```
"This is a statistical model for educational purposes only.
It is NOT financial advice. Past performance does not guarantee future results.
ShareSathi is not a registered investment advisor."
```

---

## 9. Deployment Architecture

### 9.1 Current Setup

```
Frontend: InsForge Hosting (Vercel-backed)
  URL: https://vicia6je.insforge.site
  Deploy: InsForge create-deployment MCP tool

Backend: Not deployed (runs locally)
  Intended: Docker + Heroku/Railway

Database: InsForge PostgreSQL
  URL: https://vicia6je.us-east.insforge.app

Cache: Redis (not deployed)
```

### 9.2 Production Architecture

```
┌─────────────────────────────────────┐
│ DNS: sharesathi.com                  │
│ → Cloudflare (CDN + DDoS protection)│
└──────────┬──────────────────────────┘
           │
    ┌──────▼──────┐
    │ InsForge     │
    │ Hosting      │  ← Static frontend (React build)
    │ (Vercel)     │     Custom domain: sharesathi.com
    └──────┬──────┘
           │
    ┌──────▼──────────────────────────┐
    │ InsForge BaaS                    │
    │ ├── Auth (email + OAuth)         │
    │ ├── PostgreSQL (PostgREST)       │
    │ ├── Storage (user uploads)       │
    │ └── Realtime (WebSocket)         │
    └──────────────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │ Railway / Render / Fly.io        │
    │ ├── FastAPI (2 workers)          │
    │ ├── APScheduler (cron jobs)      │
    │ └── Redis (managed add-on)       │
    │                                  │
    │ Cost: $5-20/month                │
    └──────────────────────────────────┘
```

### 9.3 Step-by-Step Production Deployment

#### Step 1: Backend Deployment (Railway recommended for Nepal startups)

```bash
# railway.toml
[build]
builder = "dockerfile"
dockerfilePath = "backend/docker/Dockerfile"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2"
healthcheckPath = "/health"
restartPolicyType = "on_failure"

[service]
name = "sharesathi-api"
```

Environment variables to set:
```
ENVIRONMENT=production
SECRET_KEY=<generated-64-char-key>
DATABASE_URL=<your-insforge-postgres-connection-string>
REDIS_URL=<railway-redis-url>
INSFORGE_URL=https://vicia6je.us-east.insforge.app
INSFORGE_SERVICE_KEY=<service-role-key>
ALLOWED_ORIGINS=https://sharesathi.com,https://vicia6je.insforge.site
SENTRY_DSN=<optional-sentry-dsn>
```

#### Step 2: Frontend Deployment

Already deployed via InsForge. For custom domain:

1. Buy `sharesathi.com` (Rs. 1,500/year on Namecheap or Porkbun)
2. Point DNS to InsForge hosting
3. InsForge auto-provisions SSL

#### Step 3: CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Frontend — lint & type-check
        working-directory: frontend
        run: |
          npm ci
          npm run lint
          npx tsc --noEmit

      - name: Backend — test
        working-directory: backend
        run: |
          pip install -r requirements.txt
          python -m pytest tests/ -v

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build frontend
        working-directory: frontend
        run: |
          npm ci
          npm run build
      # Deploy via InsForge CLI or MCP (manual for now)

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: sharesathi-api
```

#### Step 4: Monitoring

```
Monitoring Stack (free tier):
├── Sentry — Error tracking (already wired, just set SENTRY_DSN)
├── UptimeRobot — Uptime monitoring (free, 5-min checks)
├── Railway metrics — CPU, memory, request count
└── InsForge dashboard — DB usage, auth events
```

### 9.4 Cost Analysis

| Service | Free Tier | Paid (when scaling) |
|---------|-----------|-------------------|
| InsForge hosting | Free | — |
| InsForge BaaS | Free tier | $10-25/mo |
| Railway (backend) | $5 credit/mo | $5-20/mo |
| Railway Redis | Included | Included |
| Domain | — | $12/year |
| Sentry | 5K events/mo free | $26/mo |
| **Total MVP** | **~$5/mo** | **$30-60/mo** |

---

## 10. Startup Roadmap

### Stage 1: MVP Polish (Weeks 1-4)

**Goal**: A product you can show to 100 beta users and get feedback.

| Task | Priority | Effort |
|------|----------|--------|
| Unify database on InsForge (see Section 3) | P0 | 1 week |
| Fix hardcoded SECRET_KEY for production | P0 | 1 hour |
| Deploy backend to Railway | P0 | 2 hours |
| Create `execute_trade` PostgreSQL function | P0 | 3 hours |
| Add proper error handling + loading states everywhere | P0 | 2 days |
| Fix ARIMA confidence score (backtest, not hardcoded) | P1 | 4 hours |
| Set up GitHub Actions CI/CD | P1 | 3 hours |
| Write landing page copy (English + Nepali) | P1 | 2 days |
| Add 10 basic unit tests for trading logic | P1 | 1 day |
| Set up Sentry error tracking | P2 | 1 hour |

**Exit criteria**: Users can register, login, browse market, execute paper trades, see portfolio — without errors.

### Stage 2: Beta Launch (Weeks 5-8)

**Goal**: 500 users, feedback loop, iterate on UI/UX.

| Task | Priority | Effort |
|------|----------|--------|
| Launch on Nepali Facebook groups + Reddit r/Nepal | P0 | Ongoing |
| Activate Khalti payment integration | P0 | 1 week |
| Complete admin dashboard (user management, analytics) | P0 | 1 week |
| Add React Query for data fetching | P1 | 3 days |
| WebSocket integration for live market data | P1 | 3 days |
| Complete i18n (Nepali translations) | P1 | 2 days |
| Add email notifications (trade confirmations) | P1 | 2 days |
| Screener: filter stocks by P/E, volume, sector | P2 | 3 days |
| Add Google Analytics + Hotjar | P2 | 2 hours |

**Exit criteria**: 500 registered users, <5% churn in first week, payment processing works.

### Stage 3: Growth (Months 3-4)

**Goal**: 2,000 users, first paying customers, feature depth.

| Task | Priority | Effort |
|------|----------|--------|
| LSTM model training + deployment | P0 | 2 weeks |
| Trading competitions (weekly, prizes) | P0 | 1 week |
| Referral program (earn credits for invites) | P1 | 3 days |
| Portfolio analytics (XIRR, sector allocation) | P1 | 1 week |
| IPO application tracker | P1 | 3 days |
| Mobile PWA optimization | P2 | 3 days |
| Blog / learn section with NEPSE educational content | P2 | Ongoing |

**Exit criteria**: 2,000 users, 50+ paying subscribers, LSTM model deployed.

### Stage 4: Monetization (Months 5-8)

**Goal**: Rs. 50,000/month revenue, sustainable growth.

| Task | Priority | Effort |
|------|----------|--------|
| Pro tier: advanced AI predictions + portfolio analytics | P0 | 2 weeks |
| eSewa payment integration | P0 | 1 week |
| B2B: pitch to broker companies as training tool | P0 | Ongoing |
| API access (paid tier) for third-party developers | P1 | 2 weeks |
| Ensemble model (ARIMA + LSTM) | P1 | 1 week |
| Alert system: SMS/push for price targets, IPO, news | P1 | 2 weeks |
| Android app (React Native or Capacitor) | P2 | 4-6 weeks |

**Exit criteria**: Rs. 50K/month recurring revenue, 5,000+ users.

### Stage 5: Scale (Months 9-18)

**Goal**: 10,000 users, Rs. 2L+/month revenue, raise seed funding.

| Task | Priority | Effort |
|------|----------|--------|
| Institutional features (college trading labs) | P0 | 4 weeks |
| Real broker integration (when NEPSE APIs allow) | P0 | 2-3 months |
| Advanced AI: sentiment analysis from Nepali news | P1 | 4 weeks |
| Multi-market (India NSE/BSE paper trading) | P2 | 2-3 months |
| Seek SEBON compliance certification | P0 | Ongoing |

---

## 11. Monetization Strategy

### 11.1 Revenue Streams

```
Revenue Model (Nepal context):
│
├── 1. SUBSCRIPTION TIERS (Primary)
│   ├── Free:  Basic paper trading, 5 trades/day, ARIMA predictions
│   ├── Basic: Rs. 299/month — 20 trades/day, stock screener, alerts
│   └── Pro:   Rs. 799/month — Unlimited trades, LSTM AI, portfolio analytics, API access
│
├── 2. CREDIT SYSTEM (Microtransactions)
│   ├── Starter Pack:   50 credits  = Rs. 99
│   ├── Trader Pack:    200 credits = Rs. 299
│   ├── Pro Pack:       500 credits = Rs. 599
│   └── Whale Pack:     1500 credits = Rs. 1,499
│   └── Credits used for: practice trades, AI predictions, premium features
│
├── 3. TRADING COMPETITIONS (Events)
│   ├── Weekly challenge: Rs. 100 entry → winner takes pool
│   ├── Monthly tournament: Rs. 500 entry → Rs. 10K prize
│   └── College competitions: sponsored by brokers
│
├── 4. B2B / INSTITUTIONAL
│   ├── Broker training platform: Rs. 10,000/month per broker
│   ├── College lab license: Rs. 5,000/semester per institution
│   └── API access: Rs. 2,000/month for developers
│
└── 5. FUTURE (12+ months)
    ├── Real trading integration (commission on trades)
    ├── Sponsored content (broker ads, IPO promotions)
    └── Data/analytics API
```

### 11.2 Payment Integration (Nepal)

Currently, `frontend/src/services/db/payment.ts` is a stub. Here's how to activate:

#### Khalti (Recommended for web)

```typescript
// frontend/src/services/payment/khalti.ts
const KHALTI_PUBLIC_KEY = import.meta.env.VITE_KHALTI_PUBLIC_KEY;

export async function initiateKhaltiPayment(params: {
  amount: number;       // In paisa (Rs. 299 = 29900)
  productName: string;
  productId: string;
  userId: string;
}) {
  // 1. Call your backend to create a payment intent
  const response = await fetch('/api/v1/payments/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const { pidx, payment_url } = await response.json();

  // 2. Redirect to Khalti payment page
  window.location.href = payment_url;

  // 3. Khalti redirects back to your callback URL
  // 4. Backend verifies payment via Khalti API
  // 5. Backend activates subscription / credits
}
```

#### Backend payment verification

```python
# backend/app/api/payments.py
@router.post("/verify")
async def verify_payment(pidx: str, db: AsyncSession = Depends(get_db)):
    # Verify with Khalti API
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://khalti.com/api/v2/epayment/lookup/",
            headers={"Authorization": f"Key {KHALTI_SECRET_KEY}"},
            json={"pidx": pidx}
        )

    result = response.json()
    if result["status"] == "Completed":
        # Activate subscription or add credits
        await activate_purchase(db, result["purchase_order_id"], result["total_amount"])
        return {"success": True}

    return {"success": False, "message": "Payment not completed"}
```

### 11.3 Pricing Psychology

| Principle | Application |
|-----------|------------|
| Anchor high | Show Pro plan first, then Basic looks cheap |
| Free forever | Free tier stays free forever — builds trust |
| Annual discount | 20% off annual plans (Rs. 299/mo → Rs. 239/mo billed yearly) |
| Trial | 7-day free trial of Pro features for new users |
| NPR pricing | Always show in Nepali Rupees (Rs. 299, not $2.99) |

---

## 12. Critical Mistakes to Avoid

### 1. "Building Too Much Before Launching"

You already have a working product. **Stop building new features** and launch to users NOW. Your first 100 users will tell you what to build next better than any roadmap.

**Action**: Set a launch date 2 weeks from today. Cut anything that's not done by then.

### 2. "Two Databases, Two User Systems"

This is your biggest technical debt. Every day you operate with a split database makes migration harder. Fix this in Stage 1, before you have real users with real data.

### 3. "Hardcoded Secrets in Source Code"

```python
SECRET_KEY: str = "dev-secret-change-in-production-min-32-chars!!"
```

This is in your git history forever. Even after changing it, anyone who clones your repo sees it. If you ever switch to real money, this is a liability.

**Action**: 
- Rotate ALL secrets immediately
- Use environment variables exclusively
- Add `.env` to `.gitignore` (verify it's there)
- Consider `git filter-branch` or BFG to scrub history

### 4. "Fake AI Confidence Scores"

```python
"ai_confidence_score": 0.85  # HARDCODED
```

If this reaches users who make real financial decisions based on it, you have a legal liability. Nepal's consumer protection laws apply here.

**Action**: Either calculate a real confidence score from backtesting, or remove the field entirely and say "experimental" instead.

### 5. "No Legal Disclaimers"

**You MUST have these on every page**:
- "ShareSathi is a paper trading platform for educational purposes only"
- "Not registered as an investment advisor with SEBON"
- "AI predictions are statistical estimates, not financial advice"
- "Past performance does not guarantee future results"

Put it in the footer, on every AI prediction, and in the Terms of Service. If SEBON comes knocking, this is your first line of defense.

### 6. "Ignoring NEPSE Trading Rules"

Even for paper trading, if you don't follow NEPSE rules, users learn wrong patterns. Enforce:
- 10-share minimum lot size ✅ (you already do this)
- ±10% daily circuit breaker ❌ (not implemented)
- T+2 settlement ❌ (instant settlement in paper trading — acceptable but label it clearly)
- No short selling ❌ (not enforced)
- Trading hours ✅ (implemented but bypassed for paper trading — fine)

### 7. "No Tests"

You have `backend/tests/conftest.py` and `test_core.py` but minimal coverage. Before scaling:
- Trading engine: 100% test coverage (money logic MUST be tested)
- Fee calculation: Exact test cases from SEBON's published schedule
- Auth flow: Test login, register, token refresh, logout
- API endpoints: Happy path + error cases

### 8. "Not Tracking Metrics From Day 1"

Set up analytics BEFORE launching. You need to know:
- DAU/MAU (Daily/Monthly Active Users)
- Registration → First Trade conversion rate
- Feature usage (which pages, how long)
- Retention (Day 1, Day 7, Day 30)

Use Mixpanel (free for <1K users) or PostHog (open source, self-host).

### 9. "Building Mobile App Too Early"

Your PWA (`manifest.json`, `sw.js`) is already set up. A good responsive web app > a bad native app. Wait until you have 5,000+ web users before investing in native mobile.

### 10. "Not Talking to Users"

The biggest mistake startup founders make is building in isolation. 

**Weekly cadence**:
- Monday: Check metrics, plan week
- Wednesday: Ship one feature
- Friday: Talk to 3 users (WhatsApp, call, in-person)
- Weekend: Read feedback, adjust priorities

---

## Appendix A: Tech Stack Decision Matrix

| Decision | Chose | Why | Revisit When |
|----------|-------|-----|-------------|
| Frontend framework | React 19 | Ecosystem, hiring pool in Nepal | Never (unless going native) |
| State management | Zustand | Simple, no boilerplate | If state gets complex → consider Jotai |
| Backend framework | FastAPI | Async Python, great for ML integration | Never |
| Primary database | InsForge PostgreSQL | Free, managed, RLS, auth included | If hitting InsForge limits → self-hosted Postgres |
| Auth | InsForge Auth | Handles OAuth, email, sessions for free | If needing custom auth flows → Auth0 |
| AI framework | statsmodels + TensorFlow | ARIMA + LSTM | If needing speed → PyTorch |
| Hosting | InsForge + Railway | Free/cheap, easy deploy | If hitting scale → AWS/GCP |
| Payments | Khalti + eSewa | Only options in Nepal | When fonepay/ConnectIPS adds APIs |

## Appendix B: Key File Reference

| Purpose | File |
|---------|------|
| Frontend entry | `frontend/src/main.tsx` |
| Route definitions | `frontend/src/App.tsx` |
| InsForge client | `frontend/src/lib/insforge.ts` |
| Trading service | `frontend/src/services/db/trading.ts` |
| Auth store | `frontend/src/store/authStore.ts` |
| Backend entry | `backend/app/main.py` |
| Settings | `backend/app/config.py` |
| Trading engine | `backend/app/services/trading_service.py` |
| NEPSE scraper | `backend/app/services/nepse_service.py` |
| AI prediction | `backend/app/ai/inference/predict.py` |
| Background sync | `backend/app/background/scheduler.py` |
| Data sync to InsForge | `backend/sync_to_insforge.py` |

---

**This document is your technical north star. Print it, pin it, refer to it weekly. Update it as decisions change. Build what matters, ship fast, talk to users.**

*— ShareSathi CTO Strategy Guide, v1.0*
