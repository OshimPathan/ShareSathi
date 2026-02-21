import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
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

    // Fetch Wallet Balance
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

    // Fetch Market Data when symbol changes
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
                fetchWallet(); // Refresh balance
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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Active Trading</h1>
                    <p className="text-sm text-slate-500 mt-1">Execute paper trades against live NEPSE data</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500">Buying Power</p>
                    <p className="text-2xl font-mono text-emerald-400">Rs. {balance.toLocaleString()}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Visualizations Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Embedded Chart */}
                    <Card className="overflow-hidden border-slate-300">
                        <CardHeader className="bg-white border-b border-slate-300 pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Technical Chart</CardTitle>
                                    <p className="text-sm text-slate-500 mt-1">{symbol ? `Live OHLC for ${symbol.toUpperCase()}` : "Enter a symbol to view chart"}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 bg-slate-950">
                            <div className="h-[400px] w-full relative flex items-center justify-center">
                                {!symbol || symbol.length < 3 ? (
                                    <div className="text-slate-500 flex flex-col items-center">
                                        <svg className="w-12 h-12 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                        Waiting for Symbol Input...
                                    </div>
                                ) : !history ? (
                                    <div className="text-slate-500 animate-pulse text-sm">Loading Chart Data...</div>
                                ) : (
                                    <TradingChart data={history.map(h => ({ time: h.date, open: h.open, high: h.high, low: h.low, close: h.close }))} />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Forecast Panel – Coming Soon */}
                    <Card className="border-indigo-500/30 overflow-hidden relative shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-indigo-400">
                                <svg className="w-5 h-5 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                AI Market Forecast
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3">
                                    <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-indigo-400">Coming Soon</p>
                                <p className="text-xs text-slate-500 mt-1 max-w-xs">AI-powered market forecasts with buy/sell signals and confidence scores are under development.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Info Panel */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!stockInfo ? (
                                <div className="text-slate-500 text-sm text-center py-8">Select a stock to view details</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white border border-slate-300 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">Last Traded Price</p>
                                        <p className="text-lg font-bold text-slate-900">Rs. {stockInfo.ltp.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white border border-slate-300 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">Change</p>
                                        <p className={`text-lg font-bold ${stockInfo.percentage_change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {stockInfo.point_change >= 0 ? '+' : ''}{stockInfo.point_change.toFixed(2)} ({stockInfo.percentage_change.toFixed(2)}%)
                                        </p>
                                    </div>
                                    <div className="bg-white border border-slate-300 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">Volume</p>
                                        <p className="text-lg font-bold text-slate-900">{stockInfo.volume.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white border border-slate-300 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">Turnover</p>
                                        <p className="text-lg font-bold text-slate-900">Rs. {stockInfo.turnover.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white border border-slate-300 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">Open</p>
                                        <p className="text-sm font-bold text-slate-900 mt-1">Rs. {stockInfo.open_price.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white border border-slate-300 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">High / Low</p>
                                        <p className="text-sm font-mono text-slate-900 mt-1">{stockInfo.high.toLocaleString()} / {stockInfo.low.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white border border-slate-300 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">Previous Close</p>
                                        <p className="text-sm font-bold text-slate-900 mt-1">Rs. {stockInfo.previous_close.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white border border-slate-300 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">Sector</p>
                                        <p className="text-sm font-bold text-blue-600 mt-1">{stockInfo.sector ?? '—'}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Execution & Depth Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trade Ticket</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {message.text && (
                                <div className={`mb-6 p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleTrade} className="space-y-6">
                                {/* Action Toggle */}
                                <div className="flex rounded-md p-1 bg-slate-100 border border-slate-300">
                                    <button
                                        type="button"
                                        onClick={() => setAction("BUY")}
                                        className={`flex-1 py-2 text-sm font-medium rounded transition-all ${action === 'BUY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Buy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAction("SELL")}
                                        className={`flex-1 py-2 text-sm font-medium rounded transition-all ${action === 'SELL' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Sell
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-slate-500 font-medium block mb-2">Symbol</label>
                                        <SearchableDropdown
                                            value={symbol}
                                            onChange={(val) => setSymbol(val)}
                                            placeholder="Search Company..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-500 font-medium block mb-2">Quantity</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="w-full bg-white border border-slate-300 rounded-md p-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <Button
                                    className={`w-full py-4 text-base font-bold ${action === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Executing..." : `Confirm ${action} Order`}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Market Depth – Coming Soon */}
                    <div>
                        <Card className="h-full">
                            <CardHeader><CardTitle>Market Depth</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">Coming Soon</p>
                                    <p className="text-xs text-slate-500 mt-1 max-w-xs">Live Level 2 order book data with bid/ask depth will be available in a future update.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trading;
