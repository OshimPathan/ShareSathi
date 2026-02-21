import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Wallet, AlertTriangle, Zap, LineChart, Info, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getWallet, executeTrade, getStockBySymbol, getStockHistory } from "../../services/db";
import { TradingChart } from "../../components/charts/TradingChart";
import { SearchableDropdown } from "../../components/ui/SearchableDropdown";
import type { Stock, HistoricalPrice } from "../../types";

export const Trading = () => {
    const [balance, setBalance] = useState<number>(0);
    const [symbol, setSymbol] = useState("");
    const [quantity, setQuantity] = useState<number>(10);
    const [action, setAction] = useState<"BUY" | "SELL">("BUY");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<HistoricalPrice[] | null>(null);
    const [stockInfo, setStockInfo] = useState<Stock | null>(null);

    const fetchWallet = async () => {
        try {
            const wallet = await getWallet();
            if (wallet) setBalance(wallet.balance);
        } catch {
            // Ignore error
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    useEffect(() => {
        if (symbol.length >= 3) {
            const fetchData = async () => {
                const sym = symbol.toUpperCase();
                try {
                    const [stockRes, histRes] = await Promise.all([
                        getStockBySymbol(sym),
                        getStockHistory(sym),
                    ]);
                    setStockInfo(stockRes);
                    setHistory(histRes.length > 0 ? histRes : null);
                } catch {
                    setStockInfo(null);
                    setHistory(null);
                }
            };
            const debounce = setTimeout(fetchData, 500);
            return () => clearTimeout(debounce);
        } else {
            setStockInfo(null);
            setHistory(null);
        }
    }, [symbol]);

    const handleTrade = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });
        setIsLoading(true);

        try {
            const result = await executeTrade(symbol.toUpperCase(), quantity, action);
            if (result.success) {
                setMessage({ text: result.message, type: "success" });
                fetchWallet();
                setSymbol("");
                setQuantity(10);
            } else {
                setMessage({ text: result.message, type: "error" });
            }
        } catch {
            setMessage({
                text: "Failed to execute trade. Please check symbol or balance.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const estimatedCost = stockInfo ? stockInfo.ltp * quantity : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 animate-slide-up">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Trading</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Execute paper trades with live NEPSE prices</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <div>
                        <p className="text-[10px] text-emerald-600 font-medium leading-none">Buying Power</p>
                        <p className="text-lg font-extrabold font-mono text-emerald-700">Rs. {balance.toLocaleString()}</p>
                    </div>
                </div>
            </header>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50/80 border border-amber-200/60 animate-slide-up delay-100" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs font-semibold text-amber-800">Paper Trading Only</p>
                    <p className="text-xs text-amber-700 mt-0.5">Virtual money with real NEPSE prices. Fees mirror actual NEPSE rates.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>

                {/* Left Column — Chart + Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Chart */}
                    <Card className="overflow-hidden">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-slate-900">Technical Chart</CardTitle>
                                    <p className="text-xs text-slate-500 mt-1">{symbol ? `OHLC · ${symbol.toUpperCase()}` : "Search a symbol to begin"}</p>
                                </div>
                                {stockInfo && (
                                    <div className="text-right">
                                        <div className="text-lg font-bold font-mono text-slate-900">Rs. {stockInfo.ltp.toLocaleString()}</div>
                                        <div className={`text-xs font-bold font-mono flex items-center justify-end gap-0.5 ${stockInfo.percentage_change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {stockInfo.percentage_change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {stockInfo.point_change >= 0 ? '+' : ''}{stockInfo.point_change.toFixed(2)} ({stockInfo.percentage_change.toFixed(2)}%)
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 bg-slate-950">
                            <div className="h-[400px] w-full relative flex items-center justify-center">
                                {!symbol || symbol.length < 3 ? (
                                    <div className="text-slate-500 flex flex-col items-center gap-2">
                                        <LineChart className="w-10 h-10 text-slate-700" />
                                        <span className="text-sm">Enter a symbol to view chart</span>
                                    </div>
                                ) : !history ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-mero-teal/30 border-t-mero-teal rounded-full animate-spin" />
                                        <span className="text-slate-500 text-sm">Loading chart...</span>
                                    </div>
                                ) : (
                                    <TradingChart data={history.map(h => ({ time: h.date, open: h.open, high: h.high, low: h.low, close: h.close }))} />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Forecast + Stock Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* AI Panel */}
                        <Card className="border-indigo-200/50 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm text-indigo-600">
                                    <Zap className="w-4 h-4" />
                                    AI Market Forecast
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center py-6 text-center">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                                        <Zap className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-indigo-600">Coming Soon</p>
                                    <p className="text-xs text-slate-500 mt-1 max-w-[200px]">AI-powered buy/sell signals with confidence scores.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stock Info */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2 text-slate-900">
                                    <Info className="w-4 h-4 text-slate-400" />
                                    Stock Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!stockInfo ? (
                                    <div className="text-sm text-slate-400 text-center py-6">Select a stock</div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Open', value: `Rs. ${stockInfo.open_price.toLocaleString()}` },
                                            { label: 'High / Low', value: `${stockInfo.high.toLocaleString()} / ${stockInfo.low.toLocaleString()}` },
                                            { label: 'Volume', value: stockInfo.volume.toLocaleString() },
                                            { label: 'Turnover', value: `Rs. ${stockInfo.turnover.toLocaleString()}` },
                                            { label: 'Prev Close', value: `Rs. ${stockInfo.previous_close.toLocaleString()}` },
                                            { label: 'Sector', value: stockInfo.sector ?? '—' },
                                        ].map((item, i) => (
                                            <div key={i} className="bg-slate-50 rounded-lg p-2.5">
                                                <p className="text-[10px] text-slate-500 font-medium">{item.label}</p>
                                                <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column — Trade Ticket */}
                <div className="space-y-6">
                    <Card className="sticky top-20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-slate-900">Trade Ticket</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {message.text && (
                                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleTrade} className="space-y-5">
                                {/* BUY / SELL Toggle */}
                                <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200/80">
                                    <button
                                        type="button"
                                        onClick={() => setAction("BUY")}
                                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${action === 'BUY' ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Buy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAction("SELL")}
                                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${action === 'SELL' ? 'bg-rose-600 text-white shadow-sm shadow-rose-200' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Sell
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Symbol</label>
                                        <SearchableDropdown
                                            value={symbol}
                                            onChange={(val) => setSymbol(val)}
                                            placeholder="Search company..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Quantity</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:ring-2 focus:ring-mero-teal/20 focus:border-mero-teal outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Order Summary */}
                                {stockInfo && (
                                    <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Price</span>
                                            <span className="font-mono font-semibold text-slate-700">Rs. {stockInfo.ltp.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Qty</span>
                                            <span className="font-mono font-semibold text-slate-700">{quantity}</span>
                                        </div>
                                        <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                                            <span className="text-slate-600 font-medium">Est. Cost</span>
                                            <span className="font-mono font-bold text-slate-900">Rs. {estimatedCost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    className={`w-full py-4 text-sm font-bold rounded-xl transition-all duration-200 ${action === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-200/50' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-200/50'}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Executing...
                                        </span>
                                    ) : `Confirm ${action} Order`}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Trading;
