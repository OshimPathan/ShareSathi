import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Star, BellRing, Trash2, Plus, Eye, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { SearchableDropdown } from "../../components/ui/SearchableDropdown";
import { getWatchlist, addToWatchlist, removeFromWatchlist, updateWatchlistAlerts } from "../../services/db";
import type { WatchlistItem } from "../../types";

export const Watchlist = () => {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newSymbol, setNewSymbol] = useState("");
    const [editModeId, setEditModeId] = useState<number | null>(null);
    const [editPrices, setEditPrices] = useState({ target: "", stop: "" });

    const fetchWatchlist = async () => {
        setIsLoading(true);
        try {
            const data = await getWatchlist();
            setItems(data);
        } catch (error) {
            console.error("Failed to load watchlist", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSymbol.trim()) return;
        try {
            const result = await addToWatchlist(newSymbol.toUpperCase());
            if (result.success) {
                setNewSymbol("");
                await fetchWatchlist();
            } else {
                console.error(result.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (symbol: string) => {
        try {
            await removeFromWatchlist(symbol);
            await fetchWatchlist();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveAlerts = async (symbol: string) => {
        try {
            const targetPrice = editPrices.target ? parseFloat(editPrices.target) : null;
            const stopLoss = editPrices.stop ? parseFloat(editPrices.stop) : null;
            await updateWatchlistAlerts(symbol, targetPrice, stopLoss);
            setEditModeId(null);
            await fetchWatchlist();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-up">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <Eye className="w-6 h-6 text-mero-teal" /> Watchlist
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Track favorites &amp; set price alerts</p>
                </div>
                {isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-mero-teal"><RefreshCw className="w-4 h-4 animate-spin" /> Loading...</div>
                ) : (
                    <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-mono">{items.length} stock{items.length !== 1 ? 's' : ''} tracked</span>
                )}
            </header>

            {/* Add Stock Bar */}
            <div className="animate-slide-up delay-100" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/80">
                    <div className="flex-1 max-w-sm">
                        <SearchableDropdown
                            value={newSymbol}
                            onChange={(val) => setNewSymbol(val)}
                            placeholder="Search company to add..."
                        />
                    </div>
                    <button type="submit" className="flex items-center justify-center gap-1.5 bg-mero-teal hover:bg-mero-darkTeal text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md">
                        <Plus className="w-4 h-4" /> Add to Watchlist
                    </button>
                </form>
            </div>

            {/* Table Card */}
            <Card className="animate-slide-up delay-200" style={{ opacity: 0, animationFillMode: 'forwards' } as React.CSSProperties}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        Tracked Stocks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto -mx-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-slate-500 uppercase border-b border-slate-200">
                                    <th className="px-6 py-3 text-left font-semibold">Symbol</th>
                                    <th className="px-6 py-3 text-right font-semibold">LTP</th>
                                    <th className="px-6 py-3 text-right font-semibold">Change</th>
                                    <th className="px-6 py-3 text-right font-semibold">Target</th>
                                    <th className="px-6 py-3 text-right font-semibold">Stop Loss</th>
                                    <th className="px-6 py-3 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-14 text-center">
                                            <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                            <p className="text-sm text-slate-400 font-medium">
                                                {isLoading ? "Loading watchlist..." : "Your watchlist is empty"}
                                            </p>
                                            {!isLoading && <p className="text-xs text-slate-300 mt-1">Search and add stocks above to start tracking</p>}
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => {
                                        const price = item.current_price ?? 0;
                                        const change = item.percentage_change ?? 0;
                                        const up = change > 0;
                                        return (
                                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300 opacity-60 group-hover:opacity-100 transition-opacity" />
                                                        <Link to={`/stock/${item.symbol}`} className="font-semibold text-mero-teal hover:text-mero-darkTeal transition-colors">
                                                            {item.symbol}
                                                        </Link>
                                                    </div>
                                                    {item.company_name && (
                                                        <div className="text-[10px] text-slate-400 mt-0.5 pl-5.5">{item.company_name}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5 font-mono text-right text-slate-800 font-semibold">{price > 0 ? price.toFixed(2) : "-"}</td>
                                                <td className="px-6 py-3.5 text-right">
                                                    {change !== 0 ? (
                                                        <span className={`inline-flex items-center gap-0.5 font-mono text-xs font-bold px-2 py-0.5 rounded-full ${up ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                                                            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                            {change > 0 ? '+' : ''}{change.toFixed(2)}%
                                                        </span>
                                                    ) : <span className="text-slate-400">-</span>}
                                                </td>

                                                <td className="px-6 py-3.5 font-mono text-right">
                                                    {editModeId === item.id ? (
                                                        <input
                                                            type="number"
                                                            className="w-24 bg-white border border-emerald-200 rounded-lg px-2 py-1 text-right text-emerald-600 text-xs focus:ring-2 focus:ring-emerald-300 outline-none"
                                                            value={editPrices.target}
                                                            onChange={(e) => setEditPrices({ ...editPrices, target: e.target.value })}
                                                            placeholder="Target"
                                                        />
                                                    ) : (
                                                        <span className={item.target_price && price >= item.target_price ? "text-emerald-600 font-bold" : "text-slate-500"}>
                                                            {item.target_price || "-"}
                                                            {item.target_price && price >= item.target_price && <BellRing className="inline w-3 h-3 ml-1 text-emerald-500 animate-pulse" />}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-3.5 font-mono text-right">
                                                    {editModeId === item.id ? (
                                                        <input
                                                            type="number"
                                                            className="w-24 bg-white border border-rose-200 rounded-lg px-2 py-1 text-right text-rose-600 text-xs focus:ring-2 focus:ring-rose-300 outline-none"
                                                            value={editPrices.stop}
                                                            onChange={(e) => setEditPrices({ ...editPrices, stop: e.target.value })}
                                                            placeholder="Stop Loss"
                                                        />
                                                    ) : (
                                                        <span className={item.stop_loss && price <= item.stop_loss && price > 0 ? "text-rose-600 font-bold" : "text-slate-500"}>
                                                            {item.stop_loss || "-"}
                                                            {item.stop_loss && price <= item.stop_loss && price > 0 && <BellRing className="inline w-3 h-3 ml-1 text-rose-500 animate-pulse" />}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-3.5 text-center">
                                                    {editModeId === item.id ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleSaveAlerts(item.symbol)}
                                                                className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg hover:bg-emerald-200 font-semibold transition-colors"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditModeId(null)}
                                                                className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-lg hover:bg-slate-200 font-semibold transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditModeId(item.id);
                                                                    setEditPrices({
                                                                        target: item.target_price ? String(item.target_price) : "",
                                                                        stop: item.stop_loss ? String(item.stop_loss) : ""
                                                                    });
                                                                }}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                                title="Set Alerts"
                                                            >
                                                                <BellRing className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.symbol)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                                                                title="Remove"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Watchlist;
