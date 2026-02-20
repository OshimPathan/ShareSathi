import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import api from "../../services/api";
import useWebSocket from "../../hooks/useWebSocket";

export const StockDetail = () => {
    const { symbol } = useParams();
    const [details, setDetails] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Trading States
    const [balance, setBalance] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(10);
    const [action, setAction] = useState<"BUY" | "SELL">("BUY");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isTrading, setIsTrading] = useState(false);

    // Live Data
    const { isConnected, lastMessage } = useWebSocket("ws://localhost:8000/ws", true);

    const liveStock = useMemo(() => {
        const liveMarket = lastMessage?.live?.live_market || [];
        return liveMarket.find((s: any) => s.symbol === symbol?.toUpperCase());
    }, [lastMessage, symbol]);

    const fetchData = async () => {
        if (!symbol) return;
        setIsLoading(true);
        try {
            const [detailRes, historyRes, walletRes] = await Promise.all([
                api.get(`/stocks/${symbol}`),
                api.get(`/stocks/${symbol}/history`),
                api.get("/portfolio/wallet")
            ]);
            setDetails(detailRes.data.company);
            setHistory(historyRes.data.history || []);
            setBalance(walletRes.data.balance);
        } catch (error) {
            console.error("Failed to fetch stock details", error);
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
            const endpoint = action === "BUY" ? "/trade/buy" : "/trade/sell";
            const payload = { symbol: symbol.toUpperCase(), quantity };

            await api.post(endpoint, payload);
            setMessage({ text: `Successfully executed ${action} for ${quantity} shares of ${symbol.toUpperCase()}`, type: "success" });

            // Refresh wallet
            const walletRes = await api.get("/portfolio/wallet");
            setBalance(walletRes.data.balance);
            setQuantity(10);
        } catch (error: any) {
            setMessage({
                text: error.response?.data?.detail || "Trade failed. Check balance or holdings.",
                type: "error"
            });
        } finally {
            setIsTrading(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center animate-pulse text-slate-400">Loading {symbol} details...</div>;
    }

    const currentPrice = liveStock?.lastTradedPrice || details?.lastTradedPrice || history[history.length - 1]?.close || 0;
    const estimatedCost = currentPrice * quantity;
    const isPositive = (liveStock?.percentageChange || 0) >= 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{details?.symbol || symbol}</h1>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${isConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                            {isConnected ? 'LIVE' : 'OFFLINE'}
                        </span>
                    </div>
                    <p className="text-slate-400 mt-1">{details?.companyName || "Unknown Company"} • {details?.sector || "Sector"}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold font-mono">Rs. {currentPrice.toFixed(2)}</div>
                    {liveStock && (
                        <p className={`font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isPositive ? '↑' : '↓'} {Math.abs(liveStock.pointChange).toFixed(2)} ({Math.abs(liveStock.percentageChange).toFixed(2)}%)
                        </p>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Price History (30 Days)</CardTitle>
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
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 10', 'auto']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                                            itemStyle={{ color: '#e2e8f0' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="close"
                                            stroke={isPositive ? "#10b981" : "#f43f5e"}
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorPrice)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex justify-center items-center text-slate-500 italic">No historical data available</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Volume</CardTitle>
                        </CardHeader>
                        <CardContent className="h-48">
                            {history.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} hide />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                            cursor={{ fill: '#334155', opacity: 0.4 }}
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

                {/* Right Column - Trading & Stats */}
                <div className="space-y-6">
                    <Card className="border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Trade {symbol?.toUpperCase()}</CardTitle>
                                <span className="text-xs text-slate-400 font-mono">Wallet: Rs. {balance.toLocaleString()}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {message.text && (
                                <div className={`mb-4 p-3 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleTrade} className="space-y-4">
                                <div className="flex bg-slate-950 rounded-md p-1 border border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setAction("BUY")}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded transition-all ${action === 'BUY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        Buy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAction("SELL")}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded transition-all ${action === 'SELL' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        Sell
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400">Order Type</label>
                                    <select className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:border-blue-500">
                                        <option>Market Order</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-700/50 mt-4">
                                    <div className="flex justify-between text-sm mb-4">
                                        <span className="text-slate-400">Estimated Cost</span>
                                        <span className="font-mono font-medium">Rs. {estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Key Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Listed Shares</span>
                                    <span className="font-mono">{details?.listedShares?.toLocaleString() || "---"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Paid Up Capital</span>
                                    <span className="font-mono">Rs. {details?.paidUpCapital?.toLocaleString() || "---"}</span>
                                </div>
                                <div className="flex justify-between text-sm border-t border-slate-700/50 pt-3">
                                    <span className="text-slate-400">Today's Volume</span>
                                    <span className="font-mono">{liveStock?.volume?.toLocaleString() || "---"}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StockDetail;
