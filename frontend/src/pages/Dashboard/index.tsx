
import useWebSocket from "../../hooks/useWebSocket";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { IpoWidget } from "../../components/domain/IpoWidget";

export const Dashboard = () => {
    // The WebSocket endpoint is simply /ws based on FastAPI routing
    const { isConnected, lastMessage } = useWebSocket("ws://localhost:8000/ws", true);

    const formatCurrency = (val: number) => `Rs. ${(val / 10000000).toFixed(2)} Cr`;

    // Parse WebSocket Payload
    const summary = lastMessage?.summary?.summary;
    const liveMarket = lastMessage?.live?.live_market || [];

    // Destructure new data from WebSocket summary
    const topGainers = lastMessage?.summary?.topGainers || [];
    const topLosers = lastMessage?.summary?.topLosers || [];
    const topTurnovers = lastMessage?.summary?.topTurnovers || [];
    const subIndices = lastMessage?.summary?.subIndices || [];

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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500 font-medium">NEPSE Index</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-mono text-slate-800">
                                {summary?.nepseIndex ? summary.nepseIndex.toFixed(2) : "---.--"}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500 font-medium">Total Turnover</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-mono text-blue-600">
                                {summary?.totalTurnover ? formatCurrency(summary.totalTurnover) : "---"}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500 font-medium">Total Volume</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-mono text-slate-800">
                                {summary?.totalTradedShares ? summary.totalTradedShares.toLocaleString() : "---"}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* IPO Widget Area */}
                <div className="lg:col-span-1">
                    <IpoWidget />
                </div>
            </div>

            {/* Gainers / Losers Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-emerald-700 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Top Gainers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topGainers.length === 0 ? (
                                <div className="text-sm text-slate-500 py-4 text-center italic">Waiting...</div>
                            ) : (
                                topGainers.map((stock: any) => (
                                    <div key={stock.symbol} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0 hover:bg-slate-50 transition-colors">
                                        <span className="font-bold text-slate-800">{stock.symbol}</span>
                                        <div className="text-right">
                                            <div className="font-mono font-medium">{stock.ltp.toFixed(2)}</div>
                                            <div className="text-emerald-600 font-mono text-xs font-bold">+{stock.percentageChange.toFixed(2)}%</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-rose-700 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /> Top Losers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topLosers.length === 0 ? (
                                <div className="text-sm text-slate-500 py-4 text-center italic">Waiting...</div>
                            ) : (
                                topLosers.map((stock: any) => (
                                    <div key={stock.symbol} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0 hover:bg-slate-50 transition-colors">
                                        <span className="font-bold text-slate-800">{stock.symbol}</span>
                                        <div className="text-right">
                                            <div className="font-mono font-medium">{stock.ltp.toFixed(2)}</div>
                                            <div className="text-rose-600 font-mono text-xs font-bold">{stock.percentageChange.toFixed(2)}%</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-blue-700 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Top Turnovers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topTurnovers.length === 0 ? (
                                <div className="text-sm text-slate-500 py-4 text-center italic">Waiting...</div>
                            ) : (
                                topTurnovers.map((stock: any) => (
                                    <div key={stock.symbol} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0 hover:bg-slate-50 transition-colors">
                                        <span className="font-bold text-slate-800">{stock.symbol}</span>
                                        <div className="text-right">
                                            <div className="font-mono text-slate-500 font-medium">{(stock.turnover / 100000).toFixed(2)} Lakhs</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sub-Indices Carousel/Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {subIndices.map((index: any) => (
                    <div key={index.sector} className="bg-white border border-slate-200 shadow-sm rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="text-xs text-slate-500 truncate mb-1 font-medium" title={index.sector}>{index.sector}</div>
                        <div className="font-mono font-bold text-slate-800">{index.value.toFixed(2)}</div>
                        <div className={`font-mono text-xs mt-1 font-bold ${index.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {index.change > 0 ? '+' : ''}{index.change.toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>

            {/* All Stocks Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Live Market Watch</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 rounded-tl-md font-bold">Symbol</th>
                                    <th className="px-6 py-3 text-right font-bold">LTP (Rs)</th>
                                    <th className="px-6 py-3 text-right font-bold">Change</th>
                                    <th className="px-6 py-3 text-right font-bold">% Change</th>
                                    <th className="px-6 py-3 text-right rounded-tr-md font-bold">Volume</th>
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
                                        <tr key={stock.symbol} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 font-bold text-blue-700">{stock.symbol}</td>
                                            <td className="px-6 py-3 font-mono text-right font-medium text-slate-800">{stock.lastTradedPrice.toFixed(2)}</td>
                                            <td className={`px-6 py-3 font-mono text-right font-bold ${stock.pointChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {stock.pointChange > 0 ? '+' : ''}{stock.pointChange.toFixed(2)}
                                            </td>
                                            <td className={`px-6 py-3 font-mono text-right font-bold ${stock.percentageChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {stock.percentageChange > 0 ? '+' : ''}{stock.percentageChange.toFixed(2)}%
                                            </td>
                                            <td className="px-6 py-3 font-mono text-right text-slate-500">
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
