import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import api from "../../services/api";

export const Trading = () => {
    const [balance, setBalance] = useState<number>(0);
    const [symbol, setSymbol] = useState("");
    const [quantity, setQuantity] = useState<number>(10);
    const [action, setAction] = useState<"BUY" | "SELL">("BUY");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isLoading, setIsLoading] = useState(false);

    // Fetch Wallet Balance
    const fetchWallet = async () => {
        try {
            const res = await api.get("/portfolio/wallet");
            setBalance(res.data.balance);
        } catch (error) {
            console.error("Failed to fetch wallet", error);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

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
                <div className="lg:col-span-2 space-y-6">
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
                </div>

                <div>
                    <Card className="h-full">
                        <CardHeader><CardTitle>Market Depth</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-sm text-slate-400 italic mt-10 text-center">
                                Connect to a stock symbol to view live Level 2 Data.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Trading;
