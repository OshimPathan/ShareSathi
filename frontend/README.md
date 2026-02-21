# ShareSathi Frontend

React + TypeScript frontend for the ShareSathi paper trading platform.

## Tech Stack

- **React 19** with TypeScript 5.9
- **Vite 7** for dev server and builds
- **Tailwind CSS v4** for styling
- **Zustand 5** for state management
- **React Router DOM 7** for routing (18 routes)
- **Recharts** + **Lightweight Charts** for data visualization
- **InsForge SDK** for backend-as-a-service (auth, database, storage)

## Pages

### Public (no auth required)
| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Platform overview |
| `/login` | Login | Email/password + OAuth (Google, GitHub) |
| `/verify-email` | Verify Email | OTP email verification |
| `/about` | About | Team and mission |
| `/contact` | Contact | Contact form |
| `/market` | Market | Live NEPSE data, indices, gainers/losers |
| `/market/:type` | Market Data | Filtered market view |
| `/stock/:symbol` | Stock Detail | Price chart, depth, fundamentals |
| `/news` | News | Live financial news |
| `/ipo` | IPO | IPO listings |
| `/announcements` | Announcements | Market announcements |
| `/reports` | Reports | Market reports |
| `/services` | Services | Platform services |
| `/portfolio-info` | Portfolio Info | Portfolio feature overview |

### Protected (auth required)
| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Portfolio summary, P&L |
| `/trade` | Trading | Buy/sell with fee calculation |
| `/portfolio` | Portfolio | Holdings management |
| `/watchlist` | Watchlist | Tracked stocks |
| `/profile` | Profile | Account settings |

## Setup

```bash
cp .env.example .env    # Fill in VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY
npm install
npm run dev             # http://localhost:5173
```

## Build

```bash
npm run build           # Output in dist/
npm run preview         # Preview production build
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_INSFORGE_URL` | Yes | InsForge project URL |
| `VITE_INSFORGE_ANON_KEY` | Yes | InsForge anonymous JWT token |
| `VITE_API_URL` | No | Backend API URL (default: `http://localhost:8000/api/v1`) |
| `VITE_WS_URL` | No | WebSocket URL (default: `ws://localhost:8000`) |

## Key Architecture Decisions

- **InsForge Direct**: Frontend reads/writes to InsForge PostgREST DB directly (not through FastAPI)
- **RPC-First Trading**: Trade execution tries server-side RPC first, falls back to client-side
- **ErrorBoundary**: Global React error boundary for graceful crash recovery
- **Fee Estimation**: Client-side fee calculator mirrors backend NEPSE tiers for UI display
