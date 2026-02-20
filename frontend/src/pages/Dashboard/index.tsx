import { useMemo } from "react";
import useWebSocket from "../../hooks/useWebSocket";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";

export const Dashboard = () => {
    // The WebSocket endpoint is simply /ws based on FastAPI routing
    const { isConnected, lastMessage } = useWebSocket("ws://localhost:8000/ws", true);

    const formatCurrency = (val: number) => `Rs. ${(val / 10000000).toFixed(2)} Cr`;

    // Parse WebSocket Payload
    const summary = lastMessage?.summary?.summary;
    const liveMarket = lastMessage?.live?.live_market || [];

    // Derive Gainers and Losers
    const sortedMarket = useMemo(() => {
        if (!liveMarket.length) return { gainers: [], losers: [] };
        const sorted = [...liveMarket].sort((a, b) => b.percentageChange - a.percentageChange);
        return {
            gainers: sorted.slice(0, 5),
            losers: sorted.slice(-5).reverse()
        };
    }, [liveMarket]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Market Overview</h1>
                    <p className="text-sm text-slate-400 mt-1">Live updates from NEPSE</p>
                </div>

                <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${isConnected && lastMessage ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                    <span className={`w-2 h-2 rounded-full bg-current mr-2 ${isConnected && lastMessage ? 'animate-pulse' : ''}`} />
                    {isConnected && lastMessage ? summary?.marketStatus || "Market Open (Live)" : "Connecting to Market..."}
                </div>
            </header>

            {/* Macro Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-400">NEPSE Index</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-mono">
                            {summary?.nepseIndex ? summary.nepseIndex.toFixed(2) : "---.--"}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-400">Total Turnover</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-mono text-blue-400">
                            {summary?.totalTurnover ? formatCurrency(summary.totalTurnover) : "---"}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-400">Total Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-mono">
                            {summary?.totalTradedShares ? summary.totalTradedShares.toLocaleString() : "---"}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gainers / Losers Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-emerald-400">Top Gainers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {sortedMarket.gainers.length === 0 ? (
                                <div className="text-sm text-slate-400 py-4 text-center italic">Waiting for market data...</div>
                            ) : (
                                sortedMarket.gainers.map((stock: any) => (
                                    <div key={stock.symbol} className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-200">{stock.symbol}</span>
                                        <div className="text-right">
                                            <div className="font-mono">{stock.lastTradedPrice.toFixed(2)}</div>
                                            <div className="text-emerald-500 font-mono text-xs">+{stock.percentageChange.toFixed(2)}%</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-rose-400">Top Losers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {sortedMarket.losers.length === 0 ? (
                                <div className="text-sm text-slate-400 py-4 text-center italic">Waiting for market data...</div>
                            ) : (
                                sortedMarket.losers.map((stock: any) => (
                                    <div key={stock.symbol} className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-200">{stock.symbol}</span>
                                        <div className="text-right">
                                            <div className="font-mono">{stock.lastTradedPrice.toFixed(2)}</div>
                                            <div className="text-rose-500 font-mono text-xs">{stock.percentageChange.toFixed(2)}%</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* All Stocks Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Live Market Watch</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-3 rounded-tl-md">Symbol</th>
                                    <th className="px-6 py-3 text-right">LTP (Rs)</th>
                                    <th className="px-6 py-3 text-right">Change</th>
                                    <th className="px-6 py-3 text-right">% Change</th>
                                    <th className="px-6 py-3 text-right rounded-tr-md">Volume</th>
                                </tr>
                            </thead>
                            <tbody>
                                {liveMarket.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                                            Connecting to NEPSE Live Stream...
                                        </td>
                                    </tr>
                                ) : (
                                    liveMarket.map((stock: any) => (
                                        <tr key={stock.symbol} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                            <td className="px-6 py-3 font-bold text-blue-400">{stock.symbol}</td>
                                            <td className="px-6 py-3 font-mono text-right">{stock.lastTradedPrice.toFixed(2)}</td>
                                            <td className={`px-6 py-3 font-mono text-right ${stock.pointChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {stock.pointChange > 0 ? '+' : ''}{stock.pointChange.toFixed(2)}
                                            </td>
                                            <td className={`px-6 py-3 font-mono text-right ${stock.percentageChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {stock.percentageChange > 0 ? '+' : ''}{stock.percentageChange.toFixed(2)}%
                                            </td>
                                            <td className="px-6 py-3 font-mono text-right text-slate-400">
                                                {stock.volume.toLocaleString()}
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

export default Dashboard;
