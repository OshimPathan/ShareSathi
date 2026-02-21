# ShareSathi — Startup Roadmap

> Paper Trading & NEPSE Analytics Platform for Nepal
> Last updated: Jul 2025

---

## Vision

Become Nepal's #1 stock market learning platform — empowering beginner to intermediate investors with risk-free paper trading, real NEPSE data, and AI-powered analytics.

---

## Phase 1: Foundation (COMPLETED)

**Goal:** Working paper-trading MVP with real data

| # | Item | Status |
|---|------|--------|
| 1.1 | Real NEPSE price data via unofficial API | ✅ Done |
| 1.2 | InsForge BaaS integration (auth, DB, storage) | ✅ Done |
| 1.3 | Paper trading engine with NEPSE-accurate fees | ✅ Done |
| 1.4 | Live news scraping (ShareSansar + MeroLagani) | ✅ Done |
| 1.5 | IPO pipeline tracking | ✅ Done |
| 1.6 | Portfolio & watchlist management | ✅ Done |
| 1.7 | WebSocket real-time market broadcasting | ✅ Done |
| 1.8 | 20+ frontend pages (Market, News, Trading, etc.) | ✅ Done |
| 1.9 | Email + OAuth authentication (Google, GitHub) | ✅ Done |
| 1.10 | Background scheduler for data sync | ✅ Done |

---

## Phase 2: Startup Hardening (COMPLETED)

**Goal:** Security, legal, transparency — ready for public beta

| # | Item | Status |
|---|------|--------|
| 2.1 | Secrets moved to env vars (no hardcoded keys) | ✅ Done |
| 2.2 | Server-side trade validation (RPC, lot sizes, market hours) | ✅ Done |
| 2.3 | Client-side trade exploit removed | ✅ Done |
| 2.4 | CORS tightened + security headers added | ✅ Done |
| 2.5 | Rate limiting middleware (60 req/min per IP) | ✅ Done |
| 2.6 | Legal pages: Disclaimer, Privacy Policy, Terms of Service | ✅ Done |
| 2.7 | Global "Paper Trading" banner on every page | ✅ Done |
| 2.8 | Fake data disclaimers visible in UI (Stock Detail, Trading, Dashboard) | ✅ Done |
| 2.9 | Fake payment badges removed from footer | ✅ Done |
| 2.10 | GitHub Actions CI pipeline (tests, build, lint) | ✅ Done |
| 2.11 | Freemium pricing model (Free/Basic/Pro tiers) | ✅ Done |
| 2.12 | 14 backend tests passing | ✅ Done |

---

## Phase 3: Growth Infrastructure (COMPLETED)

**Goal:** Production deployment, payments, monitoring, user experience

| # | Item | Status | Priority |
|---|------|--------|----------|
| 3.1 | SEO meta tags + Open Graph for social sharing | ✅ Done | P0 |
| 3.2 | execute_trade RPC function in InsForge | ✅ Done | P0 |
| 3.3 | Sentry error monitoring (frontend + backend) | ✅ Done | P0 |
| 3.4 | Google Analytics integration | ✅ Done | P1 |
| 3.5 | New user onboarding welcome flow | ✅ Done | P1 |
| 3.6 | Khalti/eSewa payment integration stub | ✅ Done | P1 |
| 3.7 | Admin dashboard (users, trades, subscriptions) | ✅ Done | P1 |
| 3.8 | Production deployment guide | ✅ Done | P0 |

---

## Phase 4: Revenue & Scale (IN PROGRESS)

**Goal:** First paying users, real revenue

| # | Item | Status |
|---|------|--------|
| 4.1 | Khalti/eSewa live payment processing | ⬜ Planned |
| 4.2 | Premium feature gating enforced (watchlist limits, daily trade caps) | ✅ Done |
| 4.3 | Code splitting & lazy route loading | ✅ Done |
| 4.4 | Full UI/UX redesign (glassmorphism, animations, responsive) | ✅ Done |
| 4.5 | Profile page with subscription tier display + upgrade CTA | ✅ Done |
| 4.6 | Email notifications (trade confirmations, price alerts, weekly digest) | ⬜ Planned |
| 4.7 | Push notifications (mobile web) | ⬜ Planned |
| 4.8 | Referral program ("Invite friends, get 1 month Basic free") | ✅ Done |
| 4.9 | Custom domain + SSL (sharesathi.com) | ⬜ Planned |
| 4.10 | CDN for static assets | ⬜ Planned |
| 4.11 | Dark mode + Theme system (light/dark/system) | ✅ Done |
| 4.12 | Skeleton loaders + Error boundary | ✅ Done |
| 4.13 | PWA (manifest.json + service worker) | ✅ Done |
| 4.14 | Accessibility (skip links, ARIA labels) | ✅ Done |
| 4.15 | i18n infrastructure (English + Nepali) | ✅ Done |

---

## Phase 5: Product Expansion (IN PROGRESS)

**Goal:** Become indispensable for NEPSE investors

| # | Item | Status |
|---|------|--------|
| 5.1 | Company fundamentals + sector peer comparison | ✅ Done |
| 5.2 | Stock screener with advanced filters & sorting | ✅ Done |
| 5.3 | Social features (public portfolios, leaderboard) | ✅ Done |
| 5.4 | Mobile app (PWA — installed via browser) | ✅ Done |
| 5.5 | Broker API integration (TMS/C-ASBA link for real trading) | ⬜ Planned |
| 5.6 | Educational content (6 modules, 16 NEPSE lessons) | ✅ Done |
| 5.7 | Multi-language support (Nepali/English toggle) | ✅ Done |
| 5.8 | Advanced candlestick charts with SMA/EMA indicators | ✅ Done |
| 5.9 | In-app notification center (trade, alert, market, achievements) | ✅ Done |
| 5.10 | Chart timeframe selector (1W/1M/3M/6M/1Y/ALL) | ✅ Done |

---

## Phase 6: Moat & Market Position (PLANNED — Q4 2026)

| # | Item |
|---|------|
| 6.1 | SEBON compliance review (if offering real trading features) |
| 6.2 | Partnerships with brokers (affiliate revenue) |
| 6.3 | B2B / institutional tier (portfolio analytics for fund managers) |
| 6.4 | API marketplace (developer access to curated NEPSE data) |
| 6.5 | Strategic funding round (if metrics support) |

---

## Revenue Model

| Tier | Price | Features |
|------|-------|----------|
| **Free** | Rs. 0 | 10 watchlist stocks, 5 daily trades, basic charts |
| **Basic** | Rs. 199/mo or Rs. 1,999/yr | 50 watchlist, 25 trades, advanced charts, data export |
| **Pro** | Rs. 499/mo or Rs. 4,999/yr | Unlimited everything, AI insights, priority support |
| **Enterprise** | Custom | API access, bulk analytics, white-label |

**Payment methods (planned):** Khalti, eSewa, ConnectIPS, bank transfer

---

## Key Metrics to Track

| Metric | Target (6 months) |
|--------|-------------------|
| Registered users | 5,000+ |
| DAU (Daily Active Users) | 500+ |
| Premium conversion rate | 3-5% |
| Monthly Recurring Revenue | Rs. 50,000+ |
| Paper trades/day | 1,000+ |
| NPS score | 40+ |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4, Zustand 5 |
| Backend | FastAPI, SQLAlchemy 2.0 (async), APScheduler |
| BaaS | InsForge (PostgreSQL + Auth + Storage + Realtime) |
| Data | NepseUnofficialApi, ShareSansar/MeroLagani scraping |
| Infra | Docker, GitHub Actions CI, Vercel (frontend), Railway/Fly (backend) |
| Monitoring | Sentry (errors), Google Analytics (usage) |

---

## Team Needs

| Role | Priority | When |
|------|----------|------|
| Full-stack developer | High | Now |
| UI/UX designer | Medium | Phase 4 |
| Data engineer (NEPSE data pipelines) | Medium | Phase 5 |
| Marketing / growth | Medium | Phase 4 |
| Legal advisor (SEBON compliance) | Low | Phase 6 |
