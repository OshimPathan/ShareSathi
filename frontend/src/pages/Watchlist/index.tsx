import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Star, BellRing, Trash2, Plus } from "lucide-react";
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Watchlist & Alerts</h1>
                    <p className="text-sm text-slate-500 mt-1">Track your favorite stocks and set price alerts.</p>
                </div>
            </header>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="text-yellow-400 w-5 h-5 fill-current" />
                        My Tracked Stocks
                    </CardTitle>
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <div className="flex-1 max-w-sm">
                            <SearchableDropdown
                                value={newSymbol}
                                onChange={(val) => setNewSymbol(val)}
                                placeholder="Search Company..."
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add
                        </button>
                    </form>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto mt-4">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3">Symbol</th>
                                    <th className="px-6 py-3 text-right">LTP</th>
                                    <th className="px-6 py-3 text-right">Change %</th>
                                    <th className="px-6 py-3 text-right">Target Price</th>
                                    <th className="px-6 py-3 text-right">Stop Loss</th>
                                    <th className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                                            {isLoading ? "Loading watchlist..." : "Your watchlist is empty. Add a stock to get started."}
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => {
                                        const price = item.current_price ?? 0;
                                        const change = item.percentage_change ?? 0;
                                        return (
                                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4 font-bold flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                                                    <Link to={`/stock/${item.symbol}`} className="text-blue-600 hover:underline">
                                                        {item.symbol}
                                                    </Link>
                                                    {item.company_name && (
                                                        <span className="text-xs text-slate-500 font-normal hidden sm:inline">{item.company_name}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-right">{price > 0 ? price.toFixed(2) : "-"}</td>
                                                <td className={`px-6 py-4 font-mono text-right ${change > 0 ? "text-emerald-600" : change < 0 ? "text-rose-600" : "text-slate-500"}`}>
                                                    {change !== 0 ? `${change > 0 ? "+" : ""}${change.toFixed(2)}%` : "-"}
                                                </td>

                                                <td className="px-6 py-4 font-mono text-right">
                                                    {editModeId === item.id ? (
                                                        <input
                                                            type="number"
                                                            className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-right text-emerald-600"
                                                            value={editPrices.target}
                                                            onChange={(e) => setEditPrices({ ...editPrices, target: e.target.value })}
                                                            placeholder="Target"
                                                        />
                                                    ) : (
                                                        <span className={item.target_price && price >= item.target_price ? "text-emerald-600 font-bold" : "text-slate-500"}>
                                                            {item.target_price || "-"}
                                                            {item.target_price && price >= item.target_price && <BellRing className="inline w-3 h-3 ml-1 animate-pulse" />}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 font-mono text-right">
                                                    {editModeId === item.id ? (
                                                        <input
                                                            type="number"
                                                            className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-right text-rose-600"
                                                            value={editPrices.stop}
                                                            onChange={(e) => setEditPrices({ ...editPrices, stop: e.target.value })}
                                                            placeholder="Stop Loss"
                                                        />
                                                    ) : (
                                                        <span className={item.stop_loss && price <= item.stop_loss && price > 0 ? "text-rose-600 font-bold" : "text-slate-500"}>
                                                            {item.stop_loss || "-"}
                                                            {item.stop_loss && price <= item.stop_loss && price > 0 && <BellRing className="inline w-3 h-3 ml-1 animate-pulse" />}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    {editModeId === item.id ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleSaveAlerts(item.symbol)}
                                                                className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditModeId(null)}
                                                                className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    setEditModeId(item.id);
                                                                    setEditPrices({
                                                                        target: item.target_price ? String(item.target_price) : "",
                                                                        stop: item.stop_loss ? String(item.stop_loss) : ""
                                                                    });
                                                                }}
                                                                className="text-slate-500 hover:text-blue-600 transition-colors"
                                                                title="Set Alerts"
                                                            >
                                                                <BellRing className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.symbol)}
                                                                className="text-slate-500 hover:text-rose-500 transition-colors"
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
