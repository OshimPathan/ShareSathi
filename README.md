# 🚀 ShareSathi: Your Premium NEPSE AI Trading Companion

Welcome to **ShareSathi** – the modern, AI-powered stock analytics and trading simulation platform built specifically for the Nepal Stock Exchange (NEPSE). 

This startup is being built to democratize high-level financial data and give Nepalese traders the same elite, real-time analytics tools that global markets enjoy, combining artificial intelligence with a seamless, premium UI.

---

## 🌟 What is ShareSathi?
ShareSathi bridges the gap between raw market data and actionable insights. Whether you're a seasoned investor evaluating trends using our advanced charts, or a newcomer looking to "paper trade" and simulate your portfolio without financial risk, ShareSathi is designed to be your ultimate companion in the market.

## ✨ Key Features
- **Real-Time NEPSE Data Streams:** Live market index, top gainers, losers, and turnover via instantaneous WebSockets.
- **AI-Powered Analytics:** Price prediction models and trend visualizations to help you make data-backed decisions.
- **Risk-Free Trading Simulator:** A fully-featured paper trading module to practice your strategies with a simulated wallet. 
- **Premium Dark Fintech UI:** A sleek, minimal, and highly professional React/Tailwind frontend structured for power users.
- **Scalable Architecture:** Built as a genuine startup with a robust FastAPI + Postgres backend and an optimized React + Vite frontend.

## 🛠 Tech Stack
### **Frontend**
- **Framework:** React + Vite (TypeScript)
- **Styling:** TailwindCSS (Custom Dark Fintech Theme)
- **Data Fetching:** Axios (REST) + Native WebSockets
- **Routing:** React Router DOM
- **UI Components:** Lucide Icons, Semantic Tailwind components

### **Backend**
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL (with AsyncPG & SQLAlchemy Repository Pattern)
- **Caching & Queues:** Redis
- **Data Integration:** Unofficial NEPSE API wrappers + Apify scrapers

## 🚀 Getting Started

### 1. Run the Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

---
*Built with passion for the Nepalese stock market community.*
