import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import PublicLayout from "../../components/layout/PublicLayout";
import { useAuthStore } from "../../store/authStore";
import { getStockBySymbol, getStockHistory, getWallet, executeTrade } from "../../services/db";
import type { Stock, HistoricalPrice } from "../../types";
import { ArrowUpRight, ArrowDownRight, Zap, BarChart3, Activity, ShieldCheck, Info, LogIn, Loader2 } from "lucide-react";
import { StockDetailSkeleton } from "../../components/ui/Skeleton";

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
        return (
            <PublicLayout>
                <StockDetailSkeleton />
            </PublicLayout>
        );
    }

    const currentPrice = Number(details?.ltp || history[history.length - 1]?.close || 0);
    const pointChange = Number(details?.point_change || 0);
    const pctChange = Number(details?.percentage_change || 0);
    const estimatedCost = currentPrice * quantity;
    const isPositive = pctChange >= 0;

    return (
        <PublicLayout>
        <div className="space-y-6">
            {/* Hero Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 animate-slide-up">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{details?.symbol || symbol}</h1>
                        <span className="text-[10px] font-semibold bg-mero-teal/10 text-mero-teal px-2 py-0.5 rounded-full">{details?.sector || "Sector"}</span>
                    </div>
                    <p className="text-slate-500 mt-1 text-sm">{details?.company_name || "Unknown Company"}</p>
                </div>
                <div className="text-right animate-slide-up delay-100" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                    <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">Rs. {currentPrice.toFixed(2)}</div>
                    <div className={`inline-flex items-center gap-1 text-sm font-bold mt-1 px-2 py-0.5 rounded-full ${isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {Math.abs(pointChange).toFixed(2)} ({Math.abs(pctChange).toFixed(2)}%)
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="animate-slide-up delay-100" style={{ opacity: 0, animationFillMode: 'forwards' } as React.CSSProperties}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <Activity className="w-4 h-4 text-mero-teal" />
                                Historical Price
                            </CardTitle>
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
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 10', 'auto']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
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
                                <div className="h-full flex justify-center items-center text-slate-400 text-sm">No historical data available</div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                        {/* AI Forecast – Coming Soon */}
                        <Card className="overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-indigo-600">
                                    <Zap className="w-4 h-4" />
                                    AI Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                                        <Zap className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <p className="text-sm font-semibold text-indigo-600">Coming Soon</p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-xs">AI-powered forecasts with buy/sell signals are under development.</p>
                                    <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-[10px] text-amber-700 font-medium">Note: AI forecasts will be simulated for educational purposes only.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-900">
                                    <BarChart3 className="w-4 h-4 text-blue-500" />
                                    Volume
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-44">
                                {history.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} hide />
                                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                                cursor={{ fill: '#f1f5f9', opacity: 0.6 }}
                                            />
                                            <Bar dataKey="volume" fill="#3b82f6" opacity={0.8} radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex justify-center items-center text-slate-400 text-sm">No volume data available</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stock Info Panel */}
                    {details && (
                        <Card className="animate-slide-up delay-300" style={{ opacity: 0, animationFillMode: 'forwards' } as React.CSSProperties}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-900">
                                    <Info className="w-4 h-4 text-slate-400" />
                                    Stock Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                                    <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-700">
                                        <strong>Paper Trading Data:</strong> Prices are real NEPSE data.
                                        Fundamental metrics elsewhere are estimated for educational purposes only.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[
                                        { label: "Open", value: `Rs. ${Number(details.open_price).toLocaleString()}` },
                                        { label: "High", value: `Rs. ${Number(details.high).toLocaleString()}` },
                                        { label: "Low", value: `Rs. ${Number(details.low).toLocaleString()}` },
                                        { label: "Volume", value: Number(details.volume).toLocaleString() },
                                        { label: "Turnover", value: `Rs. ${Number(details.turnover).toLocaleString()}` },
                                        { label: "Prev Close", value: `Rs. ${Number(details.previous_close).toLocaleString()}` },
                                    ].map((stat) => (
                                <div key={stat.label} className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl hover:shadow-sm transition-shadow dark:bg-slate-700/50 dark:border-slate-600/50">
                                            <p className="text-[11px] text-slate-400 font-medium">{stat.label}</p>
                                            <p className="text-sm font-bold text-slate-800 mt-1 font-mono dark:text-slate-200">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Trading & Stats */}
                <div className="space-y-6 animate-slide-up delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                    {isAuthenticated ? (
                    <Card className="sticky top-24 shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-slate-900">Trade {symbol?.toUpperCase()}</CardTitle>
                                <span className="text-xs text-emerald-700 bg-emerald-50 font-mono px-2.5 py-1 rounded-full font-semibold">Rs. {balance.toLocaleString()}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {message.text && (
                                <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleTrade} className="space-y-4">
                                <div className="flex bg-slate-100 rounded-xl p-1">
                                    <button
                                        type="button"
                                        onClick={() => setAction("BUY")}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${action === 'BUY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Buy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAction("SELL")}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${action === 'SELL' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Sell
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-500 font-medium">Order Type</label>
                                    <select className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-mero-teal/20 focus:border-mero-teal transition-all">
                                        <option>Market Order</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-500 font-medium">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-mero-teal/20 focus:border-mero-teal transition-all font-mono"
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Price</span>
                                        <span className="font-mono text-slate-700">Rs. {currentPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold">
                                        <span className="text-slate-600">Total</span>
                                        <span className="font-mono text-slate-900">Rs. {estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <Button
                                        className={`w-full py-3.5 text-sm font-bold rounded-xl shadow-md ${action === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'}`}
                                        disabled={isTrading}
                                    >
                                        {isTrading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Execute ${action}`}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    ) : (
                    <Card className="shadow-lg">
                        <CardHeader><CardTitle className="text-slate-900">Paper Trading</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-xl bg-mero-teal/10 flex items-center justify-center mx-auto mb-3">
                                    <LogIn className="w-6 h-6 text-mero-teal" />
                                </div>
                                <p className="text-sm text-slate-500 mb-4">Sign in to practice trading {symbol?.toUpperCase()} with virtual money</p>
                                <Link to="/login" className="inline-flex items-center gap-2 px-6 py-2.5 bg-mero-teal text-white rounded-xl text-sm font-semibold hover:bg-mero-darkTeal transition-colors shadow-sm">
                                    <LogIn className="w-4 h-4" /> Sign In to Trade
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-slate-900">Key Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-[10px] text-blue-600 font-medium">Real NEPSE data · Paper trading only</span>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: "LTP", value: `Rs. ${currentPrice.toLocaleString()}` },
                                    { label: "Previous Close", value: `Rs. ${Number(details?.previous_close || 0).toLocaleString()}` },
                                    { label: "Today's Volume", value: Number(details?.volume || 0).toLocaleString(), border: true },
                                    { label: "Turnover", value: `Rs. ${Number(details?.turnover || 0).toLocaleString()}` },
                                ].map((stat) => (
                                    <div key={stat.label} className={`flex justify-between text-sm ${stat.border ? 'border-t border-slate-100 pt-3' : ''}`}>
                                        <span className="text-slate-400">{stat.label}</span>
                                        <span className="font-mono text-slate-800 font-medium">{stat.value}</span>
                                    </div>
                                ))}
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
