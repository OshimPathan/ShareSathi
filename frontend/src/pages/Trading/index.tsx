import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import api from "../../services/api";
import { TradingChart } from "../../components/charts/TradingChart";

export const Trading = () => {
    const [balance, setBalance] = useState<number>(0);
    const [symbol, setSymbol] = useState("");
    const [quantity, setQuantity] = useState<number>(10);
    const [action, setAction] = useState<"BUY" | "SELL">("BUY");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [depth, setDepth] = useState<any>(null);
    const [history, setHistory] = useState<any[] | null>(null);
    const [fundamentals, setFundamentals] = useState<any>(null);
    const [forecast, setForecast] = useState<any>(null);

    // Fetch Wallet Balance
    const fetchWallet = async () => {
        try {
            const res = await api.get("/portfolio/wallet");
            setBalance(res.data.balance);
        } catch (error) {
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
                    const [depthRes, histRes, fundRes, forecastRes] = await Promise.allSettled([
                        api.get(`/market/depth/${sym}`),
                        api.get(`/market/history/${sym}`),
                        api.get(`/market/fundamentals/${sym}`),
                        api.get(`/market/forecast/${sym}`)
                    ]);

                    if (depthRes.status === 'fulfilled') setDepth(depthRes.value.data);
                    if (histRes.status === 'fulfilled') setHistory(histRes.value.data.history);
                    if (fundRes.status === 'fulfilled') setFundamentals(fundRes.value.data);
                    if (forecastRes.status === 'fulfilled') setForecast(forecastRes.value.data);
                } catch (error) {
                    setDepth(null);
                    setHistory(null);
                    setFundamentals(null);
                    setForecast(null);
                }
            };
            const debounce = setTimeout(fetchData, 500);
            return () => clearTimeout(debounce);
        } else {
            setDepth(null);
            setHistory(null);
            setFundamentals(null);
            setForecast(null);
        }
    }, [symbol]);

    const handleTrade = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });
        setIsLoading(true);

        try {
            const endpoint = action === "BUY" ? "/trade/buy" : "/trade/sell";
            const payload = { symbol: symbol.toUpperCase(), quantity };

            await api.post(endpoint, payload);
            setMessage({ text: `Successfully executed ${action} for ${quantity} shares of ${symbol.toUpperCase()}`, type: "success" });
            fetchWallet(); // Refresh balance
            setSymbol("");
            setQuantity(10);
        } catch (error: any) {
            setMessage({
                text: error.response?.data?.detail || "Failed to execute trade. Please check symbol or balance.",
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
                    <p className="text-sm text-slate-400 mt-1">Execute paper trades against live NEPSE data</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400">Buying Power</p>
                    <p className="text-2xl font-mono text-emerald-400">Rs. {balance.toLocaleString()}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Visualizations Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Embedded Chart */}
                    <Card className="overflow-hidden border-slate-800">
                        <CardHeader className="bg-slate-900/50 border-b border-slate-800 pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Technical Chart</CardTitle>
                                    <p className="text-sm text-slate-400 mt-1">{symbol ? `Live OHLC for ${symbol.toUpperCase()}` : "Enter a symbol to view chart"}</p>
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
                                    <TradingChart data={history} />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Forecast Panel */}
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
                            {!forecast ? (
                                <div className="text-slate-500 text-sm py-4">Awaiting symbol analysis...</div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded text-sm font-bold shadow-sm ${forecast.signal.includes('BUY') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : forecast.signal.includes('SELL') ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-500/20 text-slate-300 border border-slate-600'}`}>
                                                {forecast.signal}
                                            </span>
                                            <span className="text-sm text-slate-400">Confidence: <span className="text-white font-bold">{forecast.confidence}%</span></span>
                                        </div>
                                        <div className="text-right text-xs">
                                            <span className="text-emerald-400 font-mono text-sm">Target: {forecast.targetPrice}</span>
                                            <span className="text-slate-700 mx-3">|</span>
                                            <span className="text-rose-400 font-mono text-sm">Stop: {forecast.stopLoss}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-md border border-slate-800 shadow-inner">
                                        {forecast.reasoning}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Fundamentals Panel */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Fundamentals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!fundamentals ? (
                                <div className="text-slate-500 text-sm text-center py-8">Select a stock to view fundamentals</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400">EPS (TTM)</p>
                                        <p className="text-lg font-bold text-white">Rs. {fundamentals.eps}</p>
                                    </div>
                                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400">P/E Ratio</p>
                                        <p className={`text-lg font-bold ${fundamentals.peRatio < 15 ? 'text-emerald-400' : 'text-rose-400'}`}>{fundamentals.peRatio}</p>
                                    </div>
                                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400">Book Value</p>
                                        <p className="text-lg font-bold text-white">Rs. {fundamentals.bookValue}</p>
                                    </div>
                                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400">Dividend Yield</p>
                                        <p className="text-lg font-bold text-emerald-400">{fundamentals.dividendYield}%</p>
                                    </div>
                                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                                        <p className="text-xs text-slate-400">Paid Up Capital</p>
                                        <p className="text-sm font-bold text-white mt-1 line-clamp-1">Rs. {(fundamentals.paidUpCapital / 10000000).toFixed(2)} Cr</p>
                                    </div>
                                    <div className="md:col-span-3 bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-400">Sector</p>
                                            <p className="text-sm font-bold text-blue-400">{fundamentals.sector}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400">52 Week High / Low</p>
                                            <p className="text-sm font-mono text-white">{fundamentals['52WeekHigh']} / {fundamentals['52WeekLow']}</p>
                                        </div>
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
                                <div className="flex rounded-md p-1 bg-slate-950 border border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setAction("BUY")}
                                        className={`flex-1 py-2 text-sm font-medium rounded transition-all ${action === 'BUY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        Buy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAction("SELL")}
                                        className={`flex-1 py-2 text-sm font-medium rounded transition-all ${action === 'SELL' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        Sell
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-slate-400 font-medium block mb-2">Symbol</label>
                                        <input
                                            type="text"
                                            required
                                            value={symbol}
                                            onChange={(e) => setSymbol(e.target.value)}
                                            placeholder="e.g. NABIL"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-400 font-medium block mb-2">Quantity</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
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

                    <div>
                        <Card className="h-full">
                            <CardHeader><CardTitle>Market Depth</CardTitle></CardHeader>
                            <CardContent>
                                {!depth ? (
                                    <div className="text-sm text-slate-400 italic mt-10 text-center flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        Enter a valid ticker (e.g., NABIL) <br /> to view Live Level 2 Data.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-md">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase">Symbol</p>
                                                <p className="font-bold text-blue-400">{depth.symbol}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {/* Bids Column */}
                                            <div>
                                                <div className="bg-emerald-500/10 text-emerald-400 font-medium p-1 text-center rounded-t border-b border-emerald-500/20">Buy (Bids)</div>
                                                <div className="grid grid-cols-3 text-slate-400 border-b border-slate-800 py-1">
                                                    <div className="text-left pl-1">Orders</div>
                                                    <div className="text-right">Qty</div>
                                                    <div className="text-right pr-1">Price</div>
                                                </div>
                                                {depth.bids.map((bid: any, i: number) => (
                                                    <div key={i} className="grid grid-cols-3 font-mono py-1 hover:bg-slate-800/50 cursor-default">
                                                        <div className="text-left pl-1 text-slate-500">{bid.orders}</div>
                                                        <div className="text-right text-emerald-400">{bid.quantity}</div>
                                                        <div className="text-right pr-1 font-bold text-slate-200">{bid.price.toFixed(2)}</div>
                                                    </div>
                                                ))}
                                                <div className="grid grid-cols-3 font-mono py-1 border-t border-slate-800 mt-1 text-emerald-500 font-bold bg-emerald-500/5">
                                                    <div className="col-span-2 text-right pr-2">Total Bid Qty</div>
                                                    <div className="text-right pr-1">{depth.totalBidQty.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            {/* Asks Column */}
                                            <div>
                                                <div className="bg-rose-500/10 text-rose-400 font-medium p-1 text-center rounded-t border-b border-rose-500/20">Sell (Asks)</div>
                                                <div className="grid grid-cols-3 text-slate-400 border-b border-slate-800 py-1">
                                                    <div className="text-left pl-1">Price</div>
                                                    <div className="text-right">Qty</div>
                                                    <div className="text-right pr-1">Orders</div>
                                                </div>
                                                {depth.asks.map((ask: any, i: number) => (
                                                    <div key={i} className="grid grid-cols-3 font-mono py-1 hover:bg-slate-800/50 cursor-default">
                                                        <div className="text-left pl-1 font-bold text-slate-200">{ask.price.toFixed(2)}</div>
                                                        <div className="text-right text-rose-400">{ask.quantity}</div>
                                                        <div className="text-right pr-1 text-slate-500">{ask.orders}</div>
                                                    </div>
                                                ))}
                                                <div className="grid grid-cols-3 font-mono py-1 border-t border-slate-800 mt-1 text-rose-500 font-bold bg-rose-500/5">
                                                    <div className="col-span-2 text-right pr-2">Total Ask Qty</div>
                                                    <div className="text-right pr-1">{depth.totalAskQty.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trading;
