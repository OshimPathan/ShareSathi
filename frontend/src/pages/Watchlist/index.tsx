import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Star, BellRing, Trash2, Plus } from "lucide-react";
import api from "../../services/api";
import { SearchableDropdown } from "../../components/ui/SearchableDropdown";

interface WatchlistItem {
    id: number;
    symbol: string;
    target_price: number | null;
    stop_loss: number | null;
    current_price: number;
    added_at: string;
}

export const Watchlist = () => {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newSymbol, setNewSymbol] = useState("");
    const [editModeId, setEditModeId] = useState<number | null>(null);
    const [editPrices, setEditPrices] = useState({ target: "", stop: "" });

    const fetchWatchlist = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/watchlist");
            setItems(res.data.items);
        } catch (error) {
            console.error("Failed to load watchlist", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlist();
        const intervalId = setInterval(fetchWatchlist, 10000); // Poll every 10s for live prices
        return () => clearInterval(intervalId);
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSymbol.trim()) return;
        try {
            await api.post("/watchlist", { symbol: newSymbol.toUpperCase() });
            setNewSymbol("");
            await fetchWatchlist();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (symbol: string) => {
        try {
            await api.delete(`/watchlist/${symbol}`);
            await fetchWatchlist();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveAlerts = async (symbol: string) => {
        try {
            await api.put(`/watchlist/${symbol}`, {
                target_price: editPrices.target ? parseFloat(editPrices.target) : null,
                stop_loss: editPrices.stop ? parseFloat(editPrices.stop) : null,
            });
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
                    <p className="text-sm text-slate-400 mt-1">Track your favorite stocks and set price alerts.</p>
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
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-3">Symbol</th>
                                    <th className="px-6 py-3 text-right">LTP</th>
                                    <th className="px-6 py-3 text-right">Target Price</th>
                                    <th className="px-6 py-3 text-right">Stop Loss</th>
                                    <th className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                                            {isLoading ? "Loading watchlist..." : "Your watchlist is empty. Add a stock to get started."}
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-blue-400 flex items-center gap-2">
                                                <Star className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 transition-colors" />
                                                {item.symbol}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-right">{item.current_price > 0 ? item.current_price.toFixed(2) : '-'}</td>

                                            <td className="px-6 py-4 font-mono text-right">
                                                {editModeId === item.id ? (
                                                    <input
                                                        type="number"
                                                        className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-emerald-400"
                                                        value={editPrices.target}
                                                        onChange={(e) => setEditPrices({ ...editPrices, target: e.target.value })}
                                                        placeholder="Target"
                                                    />
                                                ) : (
                                                    <span className={item.target_price && item.current_price >= item.target_price ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                                        {item.target_price || "-"}
                                                        {item.target_price && item.current_price >= item.target_price && <BellRing className="inline w-3 h-3 ml-1 animate-pulse" />}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 font-mono text-right">
                                                {editModeId === item.id ? (
                                                    <input
                                                        type="number"
                                                        className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-rose-400"
                                                        value={editPrices.stop}
                                                        onChange={(e) => setEditPrices({ ...editPrices, stop: e.target.value })}
                                                        placeholder="Stop Loss"
                                                    />
                                                ) : (
                                                    <span className={item.stop_loss && item.current_price <= item.stop_loss && item.current_price > 0 ? "text-rose-400 font-bold" : "text-slate-300"}>
                                                        {item.stop_loss || "-"}
                                                        {item.stop_loss && item.current_price <= item.stop_loss && item.current_price > 0 && <BellRing className="inline w-3 h-3 ml-1 animate-pulse" />}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {editModeId === item.id ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleSaveAlerts(item.symbol)}
                                                            className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/30"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditModeId(null)}
                                                            className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded hover:bg-slate-600"
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
                                                            className="text-slate-400 hover:text-blue-400 transition-colors"
                                                            title="Set Alerts"
                                                        >
                                                            <BellRing className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.symbol)}
                                                            className="text-slate-400 hover:text-rose-400 transition-colors"
                                                            title="Remove"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
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
