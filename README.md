<div align="center">
  <img src="https://via.placeholder.com/150/0b0f19/3b82f6?text=ShareSathi" alt="ShareSathi Logo" width="120" height="120">
  <br/>
  <h1>🚀 ShareSathi</h1>
  <p><b>Your AI-Powered Nepalese Stock Market Companion</b></p>
  <p><i>Democratizing high-level market intelligence for every investor in Nepal.</i></p>
</div>

---

## 🎯 The Vision: Why We Built ShareSathi

Trading in the Nepal Stock Exchange (NEPSE) has traditionally been daunting. Retail investors often rely on outdated platforms, chaotic rumors, or expensive consulting to make financial decisions. 

**ShareSathi changes that.** We are a modern fintech startup dedicated to making stock market analysis and trading **effortless, intelligent, and user-friendly.** 

By bridging the gap between raw, complex market data and sleek, actionable insights, ShareSathi empowers *anyone*—from rural beginners to Kathmandu's day traders—to navigate the financial markets with confidence.

---

## 💡 How We Make Trading Easy & Empower the User

ShareSathi isn't just a data dashboard; it's a financial co-pilot. Here is how we relentlessly focus on the user experience:

### 1. 🧠 AI That Actually Understands the Market
* **The Problem:** Endlessly staring at charts trying to guess the next trend is exhausting.
* **The ShareSathi Solution:** We use advanced Machine Learning (ARIMA/Prophet) to provide 7-day price forecasts and volatility risk scorings. The AI does the heavy lifting, serving up actionable insights rather than just raw numbers.

### 2. 🎮 Risk-Free Paper Trading Simulator
* **The Problem:** New investors are terrified of losing their hard-earned rupees while learning.
* **The ShareSathi Solution:** A fully simulated "paper trading" wallet with Rs. 1,000,000 in virtual funds. Users can practice real-world trading strategies against live NEPSE prices without risking a single paisa. It’s the ultimate financial playground.

### 3. ⚡ Lightning-Fast, Clean Premium UI
* **The Problem:** Existing broker platforms look like spreadsheets from 1998, causing fatigue and confusion.
* **The ShareSathi Solution:** A gorgeous, dark-themed, mobile-first fintech dashboard. We prioritize clean typography, instant WebSocket data updates (no page refreshing!), and intuitive color psychology. It looks and feels like a cutting-edge global trading app.

### 4. 📊 Everything You Need, In One Place
* **The Problem:** Jumping between TMS for trading, MeroShare for IPOs, and 3rd party sites for charts.
* **The ShareSathi Solution:** A unified interface presenting Live Indices, dynamic candlestick charts (Lightweight Charts), top gainers/losers matrices, and your personal simulated P&L analytics—all smoothly integrated.

---

## 🏗️ The Technology Under the Hood

To deliver this seamless experience, ShareSathi is built on a highly scalable, startup-ready tech stack:

*   **Frontend Magic:** React + Vite, styled precisely with TailwindCSS for that dark, premium fintech aesthetic. State-managed to handle rapid, live data updates.
*   **Backend Power:** Python FastAPI provides lightning-fast endpoints. We utilize PostgreSQL (with AsyncPG) for robust transaction handling and Redis to cache market surges instantly.
*   **Live Connectivity:** Native WebSockets push market movements the second they happen on the NEPSE floor.

## 🚀 Getting Started for Developers

We welcome collaboration as we build the premier financial tool for Nepal.

### Backend Setup
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---
<div align="center">
  <p><i>Building the future of Nepalese retail investing. Made with ❤️ for the community.</i></p>
</div>
