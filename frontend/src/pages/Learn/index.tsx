import { useState } from "react";
import { BookOpen, TrendingUp, Shield, PieChart, Landmark, ChevronDown, ChevronRight, GraduationCap, Lightbulb, Target, BarChart3 } from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";

interface Lesson {
  id: string;
  title: string;
  content: string[];
  tip?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  lessons: Lesson[];
}

const modules: Module[] = [
  {
    id: "basics",
    title: "Stock Market Basics",
    description: "What is the stock market and how does NEPSE work?",
    icon: <BookOpen className="w-5 h-5" />,
    color: "mero-teal",
    lessons: [
      {
        id: "what-is-stock",
        title: "What Is a Stock?",
        content: [
          "A stock represents partial ownership in a company. When you buy a share of Nepal Bank Limited (NBL), you own a tiny piece of that bank.",
          "Companies list their shares on the Nepal Stock Exchange (NEPSE) to raise capital. Investors buy and sell these shares through brokers registered with SEBON (Securities Board of Nepal).",
          "Stock prices change based on supply and demand — if more people want to buy a stock than sell it, the price goes up, and vice versa.",
        ],
        tip: "In Nepal, 1 lot = 10 shares (kitta). You typically buy/sell in multiples of 10.",
      },
      {
        id: "how-nepse-works",
        title: "How NEPSE Works",
        content: [
          "NEPSE (Nepal Stock Exchange) is the only stock exchange in Nepal, established in 1993. It operates from Sunday to Thursday, 11:00 AM to 3:00 PM.",
          "Trading happens through licensed brokers. There are currently 50 broker companies in Nepal. You need a DMAT (Dematerialized) account and a Meroshare account to start trading.",
          "The NEPSE Index tracks the overall market performance. When the index goes up, it means most stocks are gaining value. The index is calculated using market capitalization of listed companies.",
        ],
        tip: "NEPSE uses an automated trading system called NEPSE Trading System (NTS) since 2007.",
      },
      {
        id: "types-of-stocks",
        title: "Types of Securities in Nepal",
        content: [
          "Ordinary Shares: Regular company shares that give you ownership and voting rights. Most trading on NEPSE involves ordinary shares.",
          "Preference Shares: Shares with priority in dividends but usually no voting rights. Less common in Nepal.",
          "Debentures: Debt instruments issued by companies. You lend money and earn interest. Lower risk than shares.",
          "Mutual Funds: Pooled investment vehicles managed by professionals. Good for beginners who want diversification without picking individual stocks.",
          "Government Bonds: Issued by Nepal Rastra Bank. Safest investment option with guaranteed returns.",
        ],
      },
    ],
  },
  {
    id: "analysis",
    title: "Fundamental Analysis",
    description: "Learn to evaluate a company's financial health",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "blue-600",
    lessons: [
      {
        id: "eps-pe",
        title: "EPS & P/E Ratio",
        content: [
          "EPS (Earnings Per Share) = Net Profit ÷ Total Shares. It tells you how much profit a company makes per share. Higher EPS generally means better profitability.",
          "P/E Ratio (Price to Earnings) = Market Price ÷ EPS. It shows how many years of earnings you're paying for. A P/E of 20 means you're paying 20x the annual earnings.",
          "In Nepal, banking sector P/E ratios typically range from 15-30. Hydropower companies can have much higher P/E ratios (50-100+) because investors expect future earnings growth.",
        ],
        tip: "Compare P/E ratios within the same sector. A P/E of 25 might be cheap for hydropower but expensive for a bank.",
      },
      {
        id: "book-value",
        title: "Book Value & PBV Ratio",
        content: [
          "Book Value per Share = (Total Assets - Total Liabilities) ÷ Total Shares. It represents what each share would be worth if the company was liquidated.",
          "PBV (Price to Book Value) = Market Price ÷ Book Value. A PBV below 1 means the stock is trading below its book value — potentially undervalued.",
          "Nepali banks typically trade at PBV of 1-3. A strong bank with PBV below 1.5 could be a value opportunity, but always check why it's cheap first.",
        ],
      },
      {
        id: "dividends",
        title: "Dividends in Nepal",
        content: [
          "Cash Dividend: Companies distribute profits as cash. In Nepal, dividends are taxed at 5% for individuals.",
          "Stock Dividend (Bonus Shares): Instead of cash, companies issue additional shares. If a company declares 20% bonus, you get 2 extra shares for every 10 you own.",
          "Right Shares: Existing shareholders get the right to buy new shares at a discounted price. This is how companies raise additional capital.",
          "Book Closure Date: The date by which you must own shares to be eligible for dividends. Share prices typically drop after book closure by approximately the dividend amount.",
        ],
        tip: "In Nepal, bonus shares are more common than cash dividends, especially in the banking sector.",
      },
    ],
  },
  {
    id: "technical",
    title: "Technical Analysis",
    description: "Read charts and identify trading patterns",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "purple-600",
    lessons: [
      {
        id: "candlesticks",
        title: "Reading Candlestick Charts",
        content: [
          "Each candlestick shows 4 prices: Open, High, Low, Close (OHLC). The body shows open-to-close range; the wicks show high and low.",
          "Green/bullish candle: Close > Open (price went up). Red/bearish candle: Close < Open (price went down).",
          "Long bodies indicate strong buying/selling pressure. Short bodies (doji) indicate indecision. Wicks show rejection of prices.",
        ],
        tip: "NEPSE data updates with daily candles. Use the ShareSathi chart on each stock page to practice reading patterns.",
      },
      {
        id: "support-resistance",
        title: "Support & Resistance",
        content: [
          "Support: A price level where buying pressure prevents the stock from falling further. Think of it as a 'floor' — the stock bounces up from here.",
          "Resistance: A price level where selling pressure prevents the stock from rising further. Think of it as a 'ceiling' — the stock struggles to break above.",
          "When a resistance level is broken, it often becomes new support (and vice versa). This is a key principle in technical trading.",
          "In NEPSE context, round numbers (like 1000, 2000, 3000) often act as psychological support/resistance levels for the index.",
        ],
      },
      {
        id: "volume-analysis",
        title: "Volume Analysis",
        content: [
          "Volume = number of shares traded. High volume confirms price moves; low volume suggests weak conviction.",
          "Price up + High volume = Strong bullish signal. Price up + Low volume = Weak rally, might reverse.",
          "Price down + High volume = Strong selling pressure. Price down + Low volume = Likely just profit-taking.",
          "In NEPSE, watch for unusual volume spikes — they often precede announcements like bonus shares, rights issues, or AGM dates.",
        ],
      },
    ],
  },
  {
    id: "risk",
    title: "Risk Management",
    description: "Protect your capital with smart strategies",
    icon: <Shield className="w-5 h-5" />,
    color: "amber-600",
    lessons: [
      {
        id: "diversification",
        title: "Diversification",
        content: [
          "Don't put all your eggs in one basket. Spread investments across different sectors: Banking, Hydropower, Insurance, Microfinance, Manufacturing.",
          "In NEPSE, banking dominates (~60% of market cap). Don't over-concentrate in banks just because they're the most traded.",
          "A balanced portfolio might look like: 40% Banking, 20% Hydropower, 15% Insurance, 10% Microfinance, 15% Others.",
        ],
        tip: "ShareSathi's portfolio allocation chart shows your sector concentration — use it to check if you're too concentrated.",
      },
      {
        id: "position-sizing",
        title: "Position Sizing",
        content: [
          "Never invest more than 10-15% of your portfolio in a single stock. If that stock crashes, you won't lose everything.",
          "The 2% rule: Don't risk more than 2% of your total capital on any single trade. If you have Rs. 1,000,000, your maximum loss per trade should be Rs. 20,000.",
          "Calculate position size: If your stop loss is 10% below entry, and you can risk Rs. 20,000, then max investment = Rs. 200,000.",
        ],
      },
      {
        id: "common-mistakes",
        title: "Common Mistakes to Avoid",
        content: [
          "Herd Mentality: Don't buy just because everyone is buying. NEPSE has seen multiple bubbles where late investors lost heavily.",
          "Ignoring Fundamentals: A cheap stock price doesn't mean it's undervalued. A Rs. 100 stock can be overvalued while a Rs. 5,000 stock can be undervalued.",
          "Emotional Trading: Fear and greed are the biggest enemies. Set your buy/sell targets before entering a trade and stick to them.",
          "Not Doing Research: Read annual reports, check financial ratios, understand the business before investing real money.",
          "Over-Trading: Every trade has costs (broker commissions + SEBON fees + NEPSE fees + DP charges). Frequent trading eats into profits.",
        ],
        tip: "That's exactly why ShareSathi exists — practice with virtual money until you're confident in your strategy!",
      },
    ],
  },
  {
    id: "portfolio",
    title: "Portfolio Strategy",
    description: "Build and manage a winning portfolio",
    icon: <PieChart className="w-5 h-5" />,
    color: "emerald-600",
    lessons: [
      {
        id: "investment-goals",
        title: "Setting Investment Goals",
        content: [
          "Short-term (< 1 year): Trading based on technical analysis, momentum, and events like AGMs, bonus announcements.",
          "Medium-term (1-3 years): Investing in growing sectors like hydropower, development banks transitioning to commercial banks.",
          "Long-term (3+ years): Buy-and-hold quality stocks. Focus on consistently profitable companies with good dividend history.",
          "Your goal determines your strategy. A long-term investor shouldn't panic over daily price drops.",
        ],
      },
      {
        id: "nepse-sectors",
        title: "Understanding NEPSE Sectors",
        content: [
          "Commercial Banks: Largest sector. Stable but mature. Good for dividends. Key metrics: NPL ratio, Capital Adequacy, NIM.",
          "Development Banks: Smaller banks with growth potential. Many are merging or converting to commercial banks.",
          "Hydropower: Nepal's most promising sector. High growth potential but projects take years. Very volatile.",
          "Insurance (Life & Non-Life): Growing sector as insurance penetration in Nepal is very low (~2% of GDP).",
          "Microfinance: Serve rural areas. High interest margins but regulatory risk. Periodic crackdowns on interest rates.",
          "Manufacturing & Hotels: Cyclical sectors. Hotels benefit from tourism growth. Manufacturing depends on import policies.",
        ],
      },
    ],
  },
  {
    id: "regulatory",
    title: "NEPSE Regulations",
    description: "Know the rules before you invest",
    icon: <Landmark className="w-5 h-5" />,
    color: "rose-600",
    lessons: [
      {
        id: "sebon-rules",
        title: "SEBON & NRB Regulations",
        content: [
          "SEBON (Securities Board of Nepal) regulates the stock market. They approve IPOs, set listing requirements, and enforce market rules.",
          "Nepal Rastra Bank (NRB) regulates banks and financial institutions. Their policies on interest rates, capital requirements, and margin lending directly affect stock prices.",
          "Circuit Breakers: NEPSE has daily price limits. Stocks can move maximum ±10% in a single day (±5% for mutual funds). If NEPSE index moves ±4%, trading halts for 15 minutes.",
          "Margin Lending: Brokers can lend you money to buy stocks (up to 50-70% of stock value). This amplifies both gains and losses.",
        ],
        tip: "NRB monetary policy announcements (usually quarterly) are major market-moving events. Mark them on your calendar!",
      },
      {
        id: "taxes-fees",
        title: "Taxes & Trading Fees",
        content: [
          "Capital Gains Tax: 5% on gains for individual investors if shares are sold within 365 days. 7.5% for institutional investors.",
          "Dividend Tax: 5% TDS (Tax Deducted at Source) on cash dividends.",
          "Broker Commission: 0.36% of transaction value (negotiable for higher volumes). Minimum Rs. 25 per transaction.",
          "SEBON Fee: 0.015% of transaction value.",
          "NEPSE Fee: 0.0015% of transaction value.",
          "DP (Depository Participant) Charge: Rs. 25 per scrip per transaction for settlement.",
          "Total trading cost is approximately 0.4-0.5% per transaction, or about 0.8-1% for a round trip (buy + sell).",
        ],
        tip: "ShareSathi's paper trading engine accounts for all these NEPSE-accurate fees so your practice results are realistic!",
      },
    ],
  },
];

const LearnPage = () => {
  const [activeModule, setActiveModule] = useState<string>(modules[0].id);
  const [activeLesson, setActiveLesson] = useState<string>(modules[0].lessons[0].id);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([modules[0].id]));

  const currentModule = modules.find((m) => m.id === activeModule)!;
  const currentLesson = currentModule.lessons.find((l) => l.id === activeLesson)!;

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const selectLesson = (moduleId: string, lessonId: string) => {
    setActiveModule(moduleId);
    setActiveLesson(lessonId);
    setExpandedModules((prev) => new Set(prev).add(moduleId));
  };

  // Progress tracking
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const currentIndex =
    modules.slice(0, modules.findIndex((m) => m.id === activeModule)).reduce((sum, m) => sum + m.lessons.length, 0) +
    currentModule.lessons.findIndex((l) => l.id === activeLesson) + 1;

  return (
    <PublicLayout showTicker={false}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-mero-teal/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-mero-teal" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Learn Stock Trading
              </h1>
              <p className="text-sm text-slate-500">Master NEPSE investing with free tutorials</p>
            </div>
          </div>
          {/* Progress */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
              <div
                className="h-full bg-mero-teal rounded-full transition-all duration-500"
                style={{ width: `${(currentIndex / totalLessons) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
              {currentIndex}/{totalLessons} lessons
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Module List */}
          <aside className="lg:col-span-1">
            <nav className="space-y-1.5 sticky top-24">
              {modules.map((mod) => (
                <div key={mod.id}>
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors ${
                      activeModule === mod.id
                        ? "bg-mero-teal/10 text-mero-teal"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    {mod.icon}
                    <span className="flex-1 truncate">{mod.title}</span>
                    {expandedModules.has(mod.id) ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {expandedModules.has(mod.id) && (
                    <div className="ml-6 mt-1 space-y-0.5 animate-slide-down">
                      {mod.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => selectLesson(mod.id, lesson.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            activeLesson === lesson.id && activeModule === mod.id
                              ? "bg-mero-teal text-white"
                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          {lesson.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <article className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm dark:bg-slate-800 dark:border-slate-700/60 animate-fade-in" key={activeLesson}>
              {/* Module badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-mero-teal bg-mero-teal/10 px-2.5 py-1 rounded-full">
                  {currentModule.title}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">
                {currentLesson.title}
              </h2>

              <div className="space-y-4">
                {currentLesson.content.map((paragraph, i) => (
                  <p key={i} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {paragraph}
                  </p>
                ))}
              </div>

              {currentLesson.tip && (
                <div className="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 dark:bg-amber-900/20 dark:border-amber-700/40">
                  <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-0.5">Pro Tip</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{currentLesson.tip}</p>
                  </div>
                </div>
              )}

              {/* Nav Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    const lessonIdx = currentModule.lessons.findIndex((l) => l.id === activeLesson);
                    if (lessonIdx > 0) {
                      setActiveLesson(currentModule.lessons[lessonIdx - 1].id);
                    } else {
                      const modIdx = modules.findIndex((m) => m.id === activeModule);
                      if (modIdx > 0) {
                        const prevMod = modules[modIdx - 1];
                        setActiveModule(prevMod.id);
                        setActiveLesson(prevMod.lessons[prevMod.lessons.length - 1].id);
                        setExpandedModules((prev) => new Set(prev).add(prevMod.id));
                      }
                    }
                  }}
                  disabled={activeModule === modules[0].id && activeLesson === modules[0].lessons[0].id}
                  className="text-sm font-medium text-slate-500 hover:text-mero-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    const lessonIdx = currentModule.lessons.findIndex((l) => l.id === activeLesson);
                    if (lessonIdx < currentModule.lessons.length - 1) {
                      setActiveLesson(currentModule.lessons[lessonIdx + 1].id);
                    } else {
                      const modIdx = modules.findIndex((m) => m.id === activeModule);
                      if (modIdx < modules.length - 1) {
                        const nextMod = modules[modIdx + 1];
                        setActiveModule(nextMod.id);
                        setActiveLesson(nextMod.lessons[0].id);
                        setExpandedModules((prev) => new Set(prev).add(nextMod.id));
                      }
                    }
                  }}
                  disabled={
                    activeModule === modules[modules.length - 1].id &&
                    activeLesson === modules[modules.length - 1].lessons[modules[modules.length - 1].lessons.length - 1].id
                  }
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-mero-teal px-4 py-2 rounded-lg hover:bg-mero-darkTeal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next Lesson →
                </button>
              </div>
            </article>

            {/* CTA */}
            <div className="mt-6 bg-gradient-to-r from-mero-teal to-emerald-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center gap-4">
              <Target className="w-10 h-10 shrink-0 opacity-80" />
              <div className="flex-1 text-center sm:text-left">
                <p className="font-bold text-sm">Practice What You Learn</p>
                <p className="text-xs text-white/80 mt-0.5">
                  Apply these concepts risk-free with ShareSathi's paper trading simulator using real NEPSE data.
                </p>
              </div>
              <a
                href="/login"
                className="shrink-0 bg-white text-mero-teal px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors"
              >
                Start Trading →
              </a>
            </div>
          </main>
        </div>
      </div>
    </PublicLayout>
  );
};

export default LearnPage;
