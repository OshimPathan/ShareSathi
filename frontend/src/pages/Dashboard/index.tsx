import useWebSocket from "../../hooks/useWebSocket";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";

export const Dashboard = () => {
    const { isConnected, lastMessage } = useWebSocket("ws://localhost:8000/ws/market", true);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Market Overview</h1>
                    <p className="text-sm text-slate-400 mt-1">Live updates from NEPSE</p>
                </div>

                <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${isConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                    <span className={`w-2 h-2 rounded-full bg-current mr-2 ${isConnected ? 'animate-pulse' : ''}`} />
                    {isConnected ? "Market Open (Live)" : "Disconnected"}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-400">NEPSE Index</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-mono">
                            {lastMessage?.index?.nepseIndex ? lastMessage.index.nepseIndex.toFixed(2) : "2094.89"}
                        </div>
                        <p className="text-xs text-emerald-500 mt-2 flex items-center font-medium">
                            ↑ 12.45 (0.6%) <span className="text-slate-500 ml-2">Today</span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-emerald-400">Top Gainers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-slate-400 py-8 text-center italic border-2 border-dashed border-slate-700 rounded-md">
                            WebSocket Data Populating...
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-rose-400">Top Losers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-slate-400 py-8 text-center italic border-2 border-dashed border-slate-700 rounded-md">
                            WebSocket Data Populating...
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
