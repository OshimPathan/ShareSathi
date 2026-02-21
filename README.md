<div align="center">
  <img src="frontend/public/logo.png" alt="ShareSathi Logo" width="120" height="120">
  <br/>
  <h1>ShareSathi</h1>
  <p><b>Nepal's Paper Trading Platform — Practice with Real NEPSE Data</b></p>
  <p><i>Learn to trade on the Nepal Stock Exchange risk-free with live prices, real news, and accurate brokerage fees.</i></p>
</div>

---

## What is ShareSathi?

ShareSathi is a paper trading simulator for the Nepal Stock Exchange (NEPSE). It connects to live market data so users can practice buying and selling stocks with virtual money (Rs. 10,00,000) — without risking real capital.

**Key facts:**
- Live NEPSE prices via the unofficial NEPSE API
- Real financial news scraped from ShareSansar and MeroLagani
- Accurate NEPSE brokerage fees (tiered 0.24%–0.36% + SEBON fee + DP charge)
- Trading hours enforced (Sun–Thu 11:00–15:00 NPT)
- 10-share minimum lot size (matches NEPSE rules)

> **Disclaimer:** This is a paper trading platform for educational purposes. Fundamental data (EPS, P/E, book value) and AI forecasts are simulated. Real prices come from NEPSE.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, TypeScript 5.9, Tailwind CSS v4, Zustand, Recharts, Lightweight Charts |
| Backend API | Python FastAPI, SQLAlchemy 2.0 (async), SQLite (dev) / PostgreSQL (prod) |
| Data Layer | InsForge (PostgREST BaaS) — frontend reads/writes directly |
| Data Sync | `sync_to_insforge.py` daemon — pushes NEPSE data into InsForge DB |
| Caching | Redis (production) / fakeredis (dev fallback) |
| Auth | InsForge Auth (email/password + Google + GitHub OAuth) |

### Architecture

The frontend talks **directly** to InsForge for database reads (stocks, news, portfolio). The FastAPI backend handles server-side trade execution, WebSocket market broadcasts, and background scheduling. The sync daemon fetches live data from NEPSE and pushes it into InsForge.

```
React UI (5173) ──► InsForge (PostgREST BaaS) ◄── sync daemon (NEPSE API + News scraping)
     │
     └──────────► FastAPI Backend (8000) — trade validation, WebSocket, caching
```

---

## Features

### Public Pages
- **Landing** — Platform overview and value proposition
- **Market** — Live NEPSE index, top gainers/losers, sector indices
- **Stock Detail** — Per-symbol price chart, market depth, fundamentals (labeled as estimated)
- **News** — Live-scraped articles from ShareSansar and MeroLagani
- **IPO** — Active and upcoming IPO listings

### Authenticated Pages
- **Dashboard** — Portfolio summary, P&L, market overview
- **Trading** — Buy/sell with real-time prices, fee breakdown, lot size validation
- **Portfolio** — Holdings, average buy price, unrealized gain/loss
- **Watchlist** — Track favorite stocks
- **Profile** — Account settings

### Backend Services
- **Rate Limiting** — Per-IP sliding window (configurable, default 60 req/min)
- **WebSocket** — Live market data broadcast with 500-connection cap
- **Scheduler** — EOD market sync after market close
- **Brokerage Calculator** — NEPSE tiered commission + SEBON + DP fees

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- (Optional) Redis — falls back to fakeredis automatically

### 1. Clone

```bash
git clone https://github.com/OshimPathan/ShareSathi.git
cd ShareSathi
```

### 2. Backend

```bash
cd backend
cp .env.example .env    # Fill in INSFORGE_BASE_URL and INSFORGE_ANON_KEY
pip install -r requirements.txt
python -m pytest tests/ -v
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env    # Fill in VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY
npm install
npm run dev
```

### 4. Data Sync Daemon (Optional)

Pushes live NEPSE data into the InsForge database:

```bash
cd backend
python sync_to_insforge.py
# Runs continuously: prices every 2 min, news every 30 min, IPO every 6 hr
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | JWT signing key (change in production) |
| `DATABASE_URL` | Yes | SQLAlchemy async URL (SQLite or PostgreSQL) |
| `REDIS_URL` | No | Redis connection URL (falls back to fakeredis) |
| `INSFORGE_BASE_URL` | Yes | InsForge project URL |
| `INSFORGE_ANON_KEY` | Yes | InsForge anonymous JWT token |
| `ALLOWED_ORIGINS` | No | CORS origins (comma-separated) |
| `RATE_LIMIT_PER_MINUTE` | No | API rate limit per IP (default: 60) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_INSFORGE_URL` | Yes | InsForge project URL |
| `VITE_INSFORGE_ANON_KEY` | Yes | InsForge anonymous JWT token |
| `VITE_API_URL` | No | Backend API base URL |
| `VITE_WS_URL` | No | WebSocket URL |

---

## Project Structure

```
ShareSathi/
├── frontend/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/     # Reusable UI components + ErrorBoundary
│   │   ├── pages/          # Route pages (18 routes)
│   │   ├── services/       # InsForge DB operations
│   │   ├── store/          # Zustand state management
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # InsForge client setup
│   │   └── types/          # TypeScript interfaces
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI route handlers
│   │   ├── services/       # Business logic (trading, news, NEPSE)
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── repositories/   # Database query layer
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── cache/          # Redis caching with fakeredis fallback
│   │   ├── background/     # APScheduler tasks
│   │   ├── websocket/      # WebSocket connection manager
│   │   └── config.py       # Settings from env vars
│   ├── tests/              # pytest test suite (14 tests)
│   ├── sync_to_insforge.py # NEPSE → InsForge data sync daemon
│   └── .env.example
└── README.md
```

---

## Tests

```bash
cd backend
python -m pytest tests/ -v
```

**14 tests** covering:
- Brokerage fee calculation (6 tests) — all NEPSE tiers, boundaries, zero trade
- Market hours detection (2 tests) — trading vs non-trading days
- News service (2 tests) — response structure, category filtering
- Config safety (3 tests) — secret key, CORS parsing, rate limit
- Fee parity (1 test) — backend fee calculation consistency

---

## Security

- All secrets loaded from environment variables (never hardcoded)
- `.env` files excluded from Git via `.gitignore`
- Rate limiting middleware on all API endpoints
- WebSocket connection cap (500 max)
- Server-side trade validation (wallet cannot be manipulated from client)
- React ErrorBoundary for graceful crash recovery

---

## Known Limitations

- **Fundamentals are simulated** — EPS, P/E, book value, dividend yield are generated per symbol (clearly labeled)
- **AI forecasts are simulated** — Buy/sell/hold signals are random-weighted (clearly labeled)
- **No real money** — This is purely a paper trading educational tool
- **NEPSE API is unofficial** — May break if NEPSE changes their website

---

## Startup Roadmap

See [ROADMAP.md](ROADMAP.md) for the full 6-phase startup roadmap.

| Phase | Status | Target |
|-------|--------|--------|
| 1. Foundation (MVP) | ✅ Done | — |
| 2. Hardening (Legal, Security, CI) | ✅ Done | — |
| 3. Growth Infrastructure (SEO, Analytics, Payments, Admin) | ✅ Done | — |
| 4. Revenue & Monetization (Khalti live, premium gating) | 🔜 Next | Q2 2026 |
| 5. Product Expansion (mobile, social, competitions) | 📋 Planned | Q3 2026 |
| 6. Moat (SEBON licensing, brokerage API) | 📋 Planned | Q4 2026 |

**Revenue model:** Freemium with Free / Basic (Rs.199/mo) / Pro (Rs.499/mo) tiers.

---

<div align="center">
  <p><i>Practice trading NEPSE stocks risk-free. Built for Nepal's aspiring investors.</i></p>
</div>
