import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  ShoppingCart,
  DollarSign,
  BarChart3,
  GraduationCap,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  History,
  Briefcase,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import SEO from '../../components/ui/SEO';
import { SearchableDropdown } from '../../components/ui/SearchableDropdown';
import { useCreditStore } from '../../store/creditStore';
import {
  executePracticeTrade,
  getPracticePortfolio,
  getPracticeTrades,
  estimateFees,
  getStockBySymbol,
} from '../../services/db';
import type { Stock, PortfolioAsset, PracticeTrade } from '../../types';

// ── Tutorial Steps ──
const TUTORIAL_STEPS = [
  {
    id: 1,
    title: 'Select a Stock',
    desc: 'Search for any NEPSE-listed company. Check the current price (LTP) and today\'s change.',
    icon: <Search className="w-5 h-5" />,
  },
  {
    id: 2,
    title: 'Choose Quantity',
    desc: 'Enter how many shares you want to buy. See the estimated cost including brokerage fees.',
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    id: 3,
    title: 'Execute Trade',
    desc: 'Click Buy to purchase. Each trade costs 1 credit. The shares will appear in your practice portfolio.',
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    id: 4,
    title: 'Monitor & Sell',
    desc: 'Watch prices change, then sell when you\'re satisfied. Practice timing the market!',
    icon: <BarChart3 className="w-5 h-5" />,
  },
];

const PracticeTradingPage = () => {
  const { credits, refreshBalance } = useCreditStore();

  // Trade form state
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [stockInfo, setStockInfo] = useState<Stock | null>(null);
  const [quantity, setQuantity] = useState(10);
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [isTrading, setIsTrading] = useState(false);
  const [tradeResult, setTradeResult] = useState<{ success: boolean; message: string } | null>(null);

  // Portfolio & history
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [trades, setTrades] = useState<PracticeTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [activeTab, setActiveTab] = useState<'trade' | 'portfolio' | 'history'>('trade');

  // Load portfolio and trades
  const fetchData = async () => {
    setIsLoading(true);
    const [p, t] = await Promise.all([getPracticePortfolio(), getPracticeTrades()]);
    setPortfolio(p);
    setTrades(t);
    setIsLoading(false);
    await refreshBalance();
  };

  useEffect(() => {
    fetchData();
    // Dismiss tutorial if user has traded before
    if (trades.length > 0) setShowTutorial(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load stock info when symbol changes
  useEffect(() => {
    if (!selectedSymbol) {
      setStockInfo(null);
      return;
    }
    getStockBySymbol(selectedSymbol).then((s) => setStockInfo(s));
  }, [selectedSymbol]);

  const estimatedCost = stockInfo ? stockInfo.ltp * quantity : 0;
  const fees = useMemo(() => estimateFees(estimatedCost), [estimatedCost]);

  const handleTrade = async () => {
    if (!selectedSymbol || quantity <= 0) return;
    setIsTrading(true);
    setTradeResult(null);

    const result = await executePracticeTrade(selectedSymbol, quantity, action);
    setTradeResult(result);

    if (result.success) {
      fetchData();
    }
    setIsTrading(false);
  };

  // Portfolio summary
  const portfolioSummary = useMemo(() => {
    const totalInvestment = portfolio.reduce((s, a) => s + a.investment, 0);
    const totalValue = portfolio.reduce((s, a) => s + a.current_value, 0);
    const totalPnl = totalValue - totalInvestment;
    const pnlPct = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;
    return { totalInvestment, totalValue, totalPnl, pnlPct };
  }, [portfolio]);

  // Check if user can trade the selected stock (for sell)
  const holdingForSymbol = portfolio.find((a) => a.symbol === selectedSymbol.toUpperCase());

  return (
    <div className="space-y-6">
      <SEO
        title="Practice Trading"
        description="Practice buying and selling NEPSE stocks with credits. Learn secondary market trading risk-free."
        canonical="/practice"
        noIndex
      />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-mero-teal" /> Practice Trading
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Learn to trade with real NEPSE data — 1 credit per trade</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
            <Coins className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-[10px] text-amber-600 font-medium leading-none">Credits</p>
              <p className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
                {credits?.balance ?? 0}
              </p>
            </div>
          </div>
          <Link to="/buy-credits">
            <Button size="sm" variant="primary" className="gap-1.5">
              <Coins className="w-3.5 h-3.5" /> Buy More
            </Button>
          </Link>
        </div>
      </header>

      {/* No Credits Warning */}
      {credits && credits.balance <= 0 && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">No credits remaining</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
              You need credits to make practice trades.{' '}
              <Link to="/buy-credits" className="font-bold underline">
                Buy credits
              </Link>{' '}
              starting from just Rs 25.
            </p>
          </div>
        </div>
      )}

      {/* Tutorial Banner (collapsible) */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowTutorial(!showTutorial)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">How to Trade — Step by Step</span>
          </div>
          {showTutorial ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />}
        </button>
        {showTutorial && (
          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TUTORIAL_STEPS.map((step) => (
              <div key={step.id} className="flex items-start gap-2 bg-white dark:bg-slate-800 rounded-lg p-3 border border-blue-100 dark:border-blue-900">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  {step.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{step.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {[
          { key: 'trade', label: 'Trade', icon: <TrendingUp className="w-4 h-4" /> },
          { key: 'portfolio', label: `Portfolio (${portfolio.length})`, icon: <Briefcase className="w-4 h-4" /> },
          { key: 'history', label: `History (${trades.length})`, icon: <History className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-mero-teal text-mero-teal'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ TRADE TAB ═══ */}
      {activeTab === 'trade' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trade Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-mero-teal" /> Place Practice Trade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Buy/Sell Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setAction('BUY')}
                  className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${
                    action === 'BUY'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setAction('SELL')}
                  className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${
                    action === 'SELL'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Stock Search */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Search Stock</label>
                <SearchableDropdown
                  value={selectedSymbol}
                  onChange={(symbol) => setSelectedSymbol(symbol)}
                  placeholder="Search NEPSE stocks..."
                />
              </div>

              {/* Stock Info */}
              {stockInfo && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{stockInfo.symbol}</p>
                    <p className="text-xs text-slate-500 truncate max-w-50">{stockInfo.company_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white font-mono">Rs {stockInfo.ltp.toFixed(2)}</p>
                    <p className={`text-xs font-bold ${stockInfo.percentage_change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stockInfo.percentage_change >= 0 ? '+' : ''}{stockInfo.percentage_change.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Quantity (Kitta)</label>
                <div className="flex items-center gap-2">
                  {[10, 50, 100].map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuantity(q)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        quantity === q
                          ? 'bg-mero-teal text-white border-mero-teal'
                          : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-mero-teal'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-mero-teal/20 focus:border-mero-teal"
                    placeholder="Custom qty"
                    title="Number of shares"
                  />
                </div>
              </div>

              {/* Sell availability info */}
              {action === 'SELL' && selectedSymbol && (
                <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
                  You hold: <strong>{holdingForSymbol?.quantity ?? 0}</strong> shares of {selectedSymbol.toUpperCase()}
                </div>
              )}

              {/* Cost Breakdown */}
              {stockInfo && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Trade Amount</span>
                    <span className="font-mono">Rs {estimatedCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Brokerage</span>
                    <span className="font-mono">Rs {fees.brokerage.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>SEBON Fee</span>
                    <span className="font-mono">Rs {fees.sebonFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>DP Charge</span>
                    <span className="font-mono">Rs {fees.dpCharge}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-800 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1.5">
                    <span>Total Estimated</span>
                    <span className="font-mono">Rs {(estimatedCost + fees.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-amber-600">
                    <span>Credit Cost</span>
                    <span className="font-bold">1 credit</span>
                  </div>
                </div>
              )}

              {/* Trade Result */}
              {tradeResult && (
                <div className={`rounded-lg p-3 text-sm ${
                  tradeResult.success
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {tradeResult.message}
                </div>
              )}

              {/* Execute Button */}
              <Button
                className="w-full py-3 gap-2"
                variant={action === 'BUY' ? 'success' : 'danger'}
                disabled={!selectedSymbol || !stockInfo || quantity <= 0 || isTrading || (credits?.balance ?? 0) <= 0}
                onClick={handleTrade}
              >
                {isTrading ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Executing...</>
                ) : (
                  <>{action === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} {action} {selectedSymbol || 'Select Stock'}</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Side Panel — Quick Portfolio */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-mero-teal" /> Portfolio Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portfolio.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No holdings yet. Make your first trade!</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Investment</span>
                      <span className="font-mono font-medium">Rs {portfolioSummary.totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Current Value</span>
                      <span className="font-mono font-medium">Rs {portfolioSummary.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                    </div>
                    <div className={`flex justify-between text-xs font-bold border-t pt-2 ${portfolioSummary.totalPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <span>P/L</span>
                      <span className="font-mono">
                        {portfolioSummary.totalPnl >= 0 ? '+' : ''}Rs {portfolioSummary.totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                        {' '}({portfolioSummary.pnlPct >= 0 ? '+' : ''}{portfolioSummary.pnlPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick holdings */}
            {portfolio.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {portfolio.map((asset) => (
                      <button
                        key={asset.symbol}
                        onClick={() => { setSelectedSymbol(asset.symbol); setAction('SELL'); }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{asset.symbol}</p>
                          <p className="text-[10px] text-slate-400">{asset.quantity} shares</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-bold ${asset.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {asset.pnl >= 0 ? '+' : ''}{asset.pnl_percentage.toFixed(1)}%
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">Rs {asset.current_price.toFixed(0)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardContent className="pt-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-slate-800 dark:text-white">{trades.length}</p>
                    <p className="text-[10px] text-slate-400">Total Trades</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-slate-800 dark:text-white">{credits?.total_spent ?? 0}</p>
                    <p className="text-[10px] text-slate-400">Credits Used</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ═══ PORTFOLIO TAB ═══ */}
      {activeTab === 'portfolio' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Practice Portfolio</CardTitle>
            <button onClick={fetchData} className="text-xs text-slate-500 hover:text-mero-teal flex items-center gap-1">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </CardHeader>
          <CardContent>
            {portfolio.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">No holdings yet</p>
                <p className="text-xs text-slate-400 mt-1">Make your first practice trade to see holdings here.</p>
                <Button className="mt-4 gap-1.5" size="sm" onClick={() => setActiveTab('trade')}>
                  <TrendingUp className="w-3.5 h-3.5" /> Start Trading
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-700">
                      <th className="text-left py-2 font-medium">Symbol</th>
                      <th className="text-right py-2 font-medium">Qty</th>
                      <th className="text-right py-2 font-medium">Avg Price</th>
                      <th className="text-right py-2 font-medium">LTP</th>
                      <th className="text-right py-2 font-medium">P/L</th>
                      <th className="text-right py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((asset) => (
                      <tr key={asset.symbol} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-2.5">
                          <Link to={`/stock/${asset.symbol}`} className="font-bold text-slate-800 dark:text-white hover:text-mero-teal">
                            {asset.symbol}
                          </Link>
                          <p className="text-[10px] text-slate-400 truncate max-w-30">{asset.company_name}</p>
                        </td>
                        <td className="text-right font-mono">{asset.quantity}</td>
                        <td className="text-right font-mono text-slate-500">Rs {asset.average_buy_price.toFixed(2)}</td>
                        <td className="text-right font-mono">Rs {asset.current_price.toFixed(2)}</td>
                        <td className={`text-right font-mono font-bold ${asset.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {asset.pnl >= 0 ? '+' : ''}Rs {asset.pnl.toFixed(0)}
                          <span className="block text-[10px]">
                            ({asset.pnl_percentage >= 0 ? '+' : ''}{asset.pnl_percentage.toFixed(1)}%)
                          </span>
                        </td>
                        <td className="text-right">
                          <Button
                            size="sm"
                            variant="danger"
                            className="text-xs px-2 py-1 h-7"
                            onClick={() => {
                              setSelectedSymbol(asset.symbol);
                              setQuantity(asset.quantity);
                              setAction('SELL');
                              setActiveTab('trade');
                            }}
                          >
                            Sell
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══ HISTORY TAB ═══ */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            {trades.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">No trades yet</p>
                <p className="text-xs text-slate-400 mt-1">Your practice trade history will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-700">
                      <th className="text-left py-2 font-medium">Date</th>
                      <th className="text-left py-2 font-medium">Symbol</th>
                      <th className="text-center py-2 font-medium">Action</th>
                      <th className="text-right py-2 font-medium">Qty</th>
                      <th className="text-right py-2 font-medium">Price</th>
                      <th className="text-right py-2 font-medium">Fees</th>
                      <th className="text-right py-2 font-medium">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id} className="border-b border-slate-50 dark:border-slate-700/50">
                        <td className="py-2 text-xs text-slate-500">
                          {new Date(trade.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2 font-bold text-slate-800 dark:text-white">{trade.symbol}</td>
                        <td className="py-2 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            trade.action === 'BUY'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                            {trade.action}
                          </span>
                        </td>
                        <td className="py-2 text-right font-mono">{trade.quantity}</td>
                        <td className="py-2 text-right font-mono">Rs {trade.price.toFixed(2)}</td>
                        <td className="py-2 text-right font-mono text-slate-400">Rs {trade.fees.toFixed(0)}</td>
                        <td className="py-2 text-right">
                          <span className="text-xs text-amber-600 font-bold">-{trade.credits_used}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PracticeTradingPage;
