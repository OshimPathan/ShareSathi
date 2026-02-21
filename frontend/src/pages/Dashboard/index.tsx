
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { IpoWidget } from "../../components/domain/IpoWidget";
import OnboardingModal from "../../components/domain/OnboardingModal";
import { getMarketBundle, getAllStocks } from "../../services/db";
import type { Stock, MarketSummary, SubIndex } from "../../types";

export const Dashboard = () => {
    const [summary, setSummary] = useState<MarketSummary | null>(null);
    const [topGainers, setTopGainers] = useState<Stock[]>([]);
    const [topLosers, setTopLosers] = useState<Stock[]>([]);
    const [topTurnovers, setTopTurnovers] = useState<Stock[]>([]);
    const [subIndices, setSubIndices] = useState<SubIndex[]>([]);
    const [allStocks, setAllStocks] = useState<Stock[]>([]);
    const [loaded, setLoaded] = useState(false);

    const formatCurrency = (val: number) => `Rs. ${(val / 10000000).toFixed(2)} Cr`;

    useEffect(() => {
        const load = async () => {
            const [bundle, stocks] = await Promise.all([
                getMarketBundle(),
                getAllStocks(),
            ]);
            if (bundle) {
                setSummary(bundle.summary);
                setTopGainers(bundle.topGainers);
                setTopLosers(bundle.topLosers);
                setTopTurnovers(bundle.topTurnovers);
                setSubIndices(bundle.subIndices);
            }
            setAllStocks(stocks);
            setLoaded(true);
        };
        load();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <OnboardingModal />
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">Market Overview</h1>
                    <p className="text-sm text-slate-500 mt-1">NEPSE data powered by ShareSathi</p>
                </div>

                <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${loaded && summary ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    <span className={`w-2 h-2 rounded-full bg-current mr-2 ${loaded && summary ? 'animate-pulse' : ''}`} />
                    {loaded && summary ? summary.market_status || "Market Data Loaded" : "Loading..."}
                </div>
            </header>

            {/* Paper Trading Notice */}
            <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <span className="text-blue-500 text-sm">📊</span>
                <p className="text-xs text-blue-700">Real NEPSE market data · Paper trading with virtual money · Not financial advice</p>
            </div>

            {/* Macro Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500 font-medium">NEPSE Index</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-mono text-slate-800">
                                {summary?.nepse_index ? Number(summary.nepse_index).toFixed(2) : "---.--"}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500 font-medium">Total Turnover</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-mono text-blue-600">
                                {summary?.total_turnover ? formatCurrency(Number(summary.total_turnover)) : "---"}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500 font-medium">Total Volume</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold font-mono text-slate-800">
                                {summary?.total_traded_shares ? Number(summary.total_traded_shares).toLocaleString() : "---"}
                            </div>
                        </CardContent>
                    </Card>
                </div>
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
                                <div className="text-sm text-slate-500 py-4 text-center italic">No data yet</div>
                            ) : (
                                topGainers.map((stock) => (
                                    <Link to={`/stock/${stock.symbol}`} key={stock.symbol} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0 hover:bg-slate-50 transition-colors">
                                        <span className="font-bold text-slate-800">{stock.symbol}</span>
                                        <div className="text-right">
                                            <div className="font-mono font-medium">{Number(stock.ltp).toFixed(2)}</div>
                                            <div className="text-emerald-600 font-mono text-xs font-bold">+{Number(stock.percentage_change).toFixed(2)}%</div>
                                        </div>
                                    </Link>
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
                                <div className="text-sm text-slate-500 py-4 text-center italic">No data yet</div>
                            ) : (
                                topLosers.map((stock) => (
                                    <Link to={`/stock/${stock.symbol}`} key={stock.symbol} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0 hover:bg-slate-50 transition-colors">
                                        <span className="font-bold text-slate-800">{stock.symbol}</span>
                                        <div className="text-right">
                                            <div className="font-mono font-medium">{Number(stock.ltp).toFixed(2)}</div>
                                            <div className="text-rose-600 font-mono text-xs font-bold">{Number(stock.percentage_change).toFixed(2)}%</div>
                                        </div>
                                    </Link>
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
                                <div className="text-sm text-slate-500 py-4 text-center italic">No data yet</div>
                            ) : (
                                topTurnovers.map((stock) => (
                                    <Link to={`/stock/${stock.symbol}`} key={stock.symbol} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0 hover:bg-slate-50 transition-colors">
                                        <span className="font-bold text-slate-800">{stock.symbol}</span>
                                        <div className="text-right">
                                            <div className="font-mono text-slate-500 font-medium">{(Number(stock.turnover) / 100000).toFixed(2)} Lakhs</div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sub-Indices Carousel/Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {subIndices.map((index) => (
                    <div key={index.sector} className="bg-white border border-slate-200 shadow-sm rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="text-xs text-slate-500 truncate mb-1 font-medium" title={index.sector}>{index.sector}</div>
                        <div className="font-mono font-bold text-slate-800">{Number(index.value).toFixed(2)}</div>
                        <div className={`font-mono text-xs mt-1 font-bold ${Number(index.change) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {Number(index.change) > 0 ? '+' : ''}{Number(index.change).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>

            {/* All Stocks Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-slate-800">Live Market Watch</CardTitle>
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
                                {allStocks.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                                            Loading market data...
                                        </td>
                                    </tr>
                                ) : (
                                    allStocks.map((stock) => (
                                        <tr key={stock.symbol} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 font-bold text-blue-700">
                                                <Link to={`/stock/${stock.symbol}`} className="hover:underline">{stock.symbol}</Link>
                                            </td>
                                            <td className="px-6 py-3 font-mono text-right font-medium text-slate-800">{Number(stock.ltp).toFixed(2)}</td>
                                            <td className={`px-6 py-3 font-mono text-right font-bold ${Number(stock.point_change) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {Number(stock.point_change) > 0 ? '+' : ''}{Number(stock.point_change).toFixed(2)}
                                            </td>
                                            <td className={`px-6 py-3 font-mono text-right font-bold ${Number(stock.percentage_change) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {Number(stock.percentage_change) > 0 ? '+' : ''}{Number(stock.percentage_change).toFixed(2)}%
                                            </td>
                                            <td className="px-6 py-3 font-mono text-right text-slate-500">
                                                {Number(stock.volume).toLocaleString()}
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
