import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import PublicLayout from "../../components/layout/PublicLayout";
import { useAuthStore } from "../../store/authStore";
import { getStockBySymbol, getStockHistory, getWallet, executeTrade } from "../../services/db";
import type { Stock, HistoricalPrice } from "../../types";

export const StockDetail = () => {
    const { symbol } = useParams();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [details, setDetails] = useState<Stock | null>(null);
    const [history, setHistory] = useState<HistoricalPrice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Trading States
    const [balance, setBalance] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(10);
    const [action, setAction] = useState<"BUY" | "SELL">("BUY");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isTrading, setIsTrading] = useState(false);

    const fetchData = async () => {
        if (!symbol) return;
        setIsLoading(true);
        try {
            const promises: Promise<unknown>[] = [
                getStockBySymbol(symbol),
                getStockHistory(symbol),
            ];
            if (isAuthenticated) promises.push(getWallet());
            const results = await Promise.all(promises);
            setDetails(results[0] as Stock | null);
            setHistory(results[1] as HistoricalPrice[]);
            if (isAuthenticated && results[2]) setBalance((results[2] as { balance: number }).balance);
        } catch {
            // Ignore error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [symbol]);

    const handleTrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol) return;

        setMessage({ text: "", type: "" });
        setIsTrading(true);

        try {
            const result = await executeTrade(symbol.toUpperCase(), quantity, action);
            if (result.success) {
                setMessage({ text: result.message, type: "success" });
                const wallet = await getWallet();
                if (wallet) setBalance(wallet.balance);
                setQuantity(10);
            } else {
                setMessage({ text: result.message, type: "error" });
            }
        } catch {
            setMessage({
                text: "Trade failed. Check balance or holdings.",
                type: "error"
            });
        } finally {
            setIsTrading(false);
        }
    };

    if (isLoading) {
        return <PublicLayout><div className="p-8 text-center animate-pulse text-slate-400">Loading {symbol} details...</div></PublicLayout>;
    }

    const currentPrice = Number(details?.ltp || history[history.length - 1]?.close || 0);
    const pointChange = Number(details?.point_change || 0);
    const pctChange = Number(details?.percentage_change || 0);
    const estimatedCost = currentPrice * quantity;
    const isPositive = pctChange >= 0;

    return (
        <PublicLayout>
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{details?.symbol || symbol}</h1>
                    </div>
                    <p className="text-slate-500 mt-1">{details?.company_name || "Unknown Company"} · {details?.sector || "Sector"}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold font-mono">Rs. {currentPrice.toFixed(2)}</div>
                    <p className={`font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? '↑' : '↓'} {Math.abs(pointChange).toFixed(2)} ({Math.abs(pctChange).toFixed(2)}%)
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historical Price</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            {history.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 10', 'auto']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', color: '#0f172a' }}
                                            itemStyle={{ color: '#334155' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="close"
                                            name="Close Price"
                                            stroke={isPositive ? "#10b981" : "#f43f5e"}
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorPrice)"
                                            connectNulls
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex justify-center items-center text-slate-500 italic">No historical data available</div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* AI Forecast – Coming Soon */}
                        <Card className="border-indigo-300/30 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-indigo-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    AI Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                                        <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-semibold text-indigo-600">Coming Soon</p>
                                    <p className="text-xs text-slate-500 mt-1 max-w-xs">AI-powered forecasts with buy/sell signals and confidence scores are under development.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Volume Data</CardTitle>
                            </CardHeader>
                            <CardContent className="h-44">
                                {history.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} hide />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px' }}
                                                cursor={{ fill: '#e2e8f0', opacity: 0.4 }}
                                            />
                                            <Bar dataKey="volume" fill="#3b82f6" opacity={0.8} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex justify-center items-center text-slate-500 italic">No volume data available</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stock Info Panel */}
                    {details && (
                        <Card>
                            <CardHeader><CardTitle>Stock Information</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">Open</p>
                                        <p className="text-lg font-bold text-slate-800">Rs. {Number(details.open_price).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">High / Low</p>
                                        <p className="text-lg font-bold text-slate-800">{Number(details.high).toLocaleString()} / {Number(details.low).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">Volume</p>
                                        <p className="text-lg font-bold text-slate-800">{Number(details.volume).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">Turnover</p>
                                        <p className="text-lg font-bold text-slate-800">Rs. {Number(details.turnover).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">Previous Close</p>
                                        <p className="text-sm font-bold text-slate-800 mt-1">Rs. {Number(details.previous_close).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                                        <p className="text-xs text-slate-500">Sector</p>
                                        <p className="text-sm font-bold text-blue-600 mt-1">{details.sector ?? '—'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Trading & Stats */}
                <div className="space-y-6">
                    {isAuthenticated ? (
                    <Card className="border-blue-300/30 shadow-sm">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Trade {symbol?.toUpperCase()}</CardTitle>
                                <span className="text-xs text-slate-500 font-mono">Wallet: Rs. {balance.toLocaleString()}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {message.text && (
                                <div className={`mb-4 p-3 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleTrade} className="space-y-4">
                                <div className="flex bg-slate-100 rounded-md p-1 border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setAction("BUY")}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded transition-all ${action === 'BUY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Buy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAction("SELL")}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded transition-all ${action === 'SELL' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Sell
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500">Order Type</label>
                                    <select className="w-full bg-white border border-slate-300 rounded-md p-2 text-sm text-slate-800 outline-none focus:border-blue-500">
                                        <option>Market Order</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="w-full bg-white border border-slate-300 rounded-md p-2 text-sm text-slate-800 outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-200 mt-4">
                                    <div className="flex justify-between text-sm mb-4">
                                        <span className="text-slate-500">Estimated Cost</span>
                                        <span className="font-mono font-medium text-slate-800">Rs. {estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <Button
                                        className={`w-full py-4 text-sm font-bold ${action === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'}`}
                                        disabled={isTrading}
                                    >
                                        {isTrading ? "Processing..." : `Execute ${action}`}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    ) : (
                    <Card className="border-blue-300/30 shadow-sm">
                        <CardHeader><CardTitle>Paper Trading</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-center py-6">
                                <p className="text-sm text-slate-500 mb-4">Sign in to practice trading {symbol?.toUpperCase()} with virtual money</p>
                                <Link to="/login" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">Sign In to Trade</Link>
                            </div>
                        </CardContent>
                    </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Key Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">LTP</span>
                                    <span className="font-mono text-slate-800">Rs. {currentPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Previous Close</span>
                                    <span className="font-mono text-slate-800">Rs. {Number(details?.previous_close || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm border-t border-slate-200 pt-3">
                                    <span className="text-slate-500">Today's Volume</span>
                                    <span className="font-mono text-slate-800">{Number(details?.volume || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Turnover</span>
                                    <span className="font-mono text-slate-800">Rs. {Number(details?.turnover || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        </PublicLayout>
    );
};

export default StockDetail;
