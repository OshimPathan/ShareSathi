import { useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, BarChart3, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { IpoWidget } from "../../components/domain/IpoWidget";
import OnboardingModal from "../../components/domain/OnboardingModal";
import { useMarketBundle, useStocks } from "../../hooks/useMarketData";
import { useMarketWebSocket } from "../../hooks/useMarketWebSocket";
import { useT } from "../../store/i18nStore";
import SEO from '../../components/ui/SEO';

export const Dashboard = () => {
    const t = useT();
    useMarketWebSocket(); // auto-connect WS and push live data into React Query cache
    const { data: bundle, isLoading: bundleLoading } = useMarketBundle();
    const { data: allStocks = [], isLoading: stocksLoading } = useStocks();
    const [searchFilter, setSearchFilter] = useState("");

    const loaded = !bundleLoading && !stocksLoading;
    const summary = bundle?.summary ?? null;
    const topGainers = bundle?.topGainers ?? [];
    const topLosers = bundle?.topLosers ?? [];
    const topTurnovers = bundle?.topTurnovers ?? [];
    const subIndices = bundle?.subIndices ?? [];

    const formatCurrency = (val: number) => `Rs. ${(val / 10000000).toFixed(2)} Cr`;

    const filteredStocks = searchFilter
        ? allStocks.filter(s => s.symbol.toLowerCase().includes(searchFilter.toLowerCase()))
        : allStocks;

    const pctChange = summary ? Number(summary.percentage_change) : 0;
    const isPositive = pctChange >= 0;

    return (
        <div className="space-y-6">
            <SEO title="Dashboard" description="Live NEPSE market dashboard with real-time index, top gainers, losers, and sector performance." canonical="/dashboard" />
            <OnboardingModal />

            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-up">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t.dashboard.title}</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{t.dashboard.subtitle}</p>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${loaded && summary ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    <span className={`w-2 h-2 rounded-full ${loaded && summary ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {loaded && summary ? summary.market_status || t.dashboard.dataLoaded : t.common.loading}
                </div>
            </header>

            {/* KPI Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-slide-up animate-in delay-100">
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* NEPSE Index */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-mero-teal/10 rounded-full blur-2xl" />
                        <p className="text-xs text-slate-400 font-medium mb-1">{t.dashboard.nepseIndex}</p>
                        <div className="text-3xl font-extrabold font-mono">
                            {summary?.nepse_index ? Number(summary.nepse_index).toFixed(2) : "---"}
                        </div>
                        {summary && (
                            <div className={`flex items-center gap-1 mt-2 text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {pctChange > 0 ? '+' : ''}{pctChange.toFixed(2)}%
                            </div>
                        )}
                    </div>

                    {/* Turnover */}
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-white">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-xs text-blue-600 font-semibold flex items-center gap-1.5">
                                <BarChart3 className="w-3.5 h-3.5" /> {t.dashboard.totalTurnover}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold font-mono text-slate-900">
                                {summary?.total_turnover ? formatCurrency(Number(summary.total_turnover)) : "---"}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Volume */}
                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-white">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-xs text-purple-600 font-semibold flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" /> {t.dashboard.totalVolume}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold font-mono text-slate-900">
                                {summary?.total_traded_shares ? Number(summary.total_traded_shares).toLocaleString() : "---"}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <IpoWidget />
                </div>
            </div>

            {/* Gainers / Losers / Turnovers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up animate-in delay-200">
                {/* Top Gainers */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-slate-900">{t.dashboard.gainers}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {topGainers.length === 0 ? (
                                <div className="text-sm text-slate-400 py-6 text-center">{t.dashboard.noDataYet}</div>
                            ) : (
                                topGainers.map((stock) => (
                                    <Link to={`/stock/${stock.symbol}`} key={stock.symbol} className="flex justify-between items-center py-2.5 px-2 -mx-2 rounded-lg hover:bg-emerald-50/50 transition-colors group">
                                        <span className="font-semibold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors">{stock.symbol}</span>
                                        <div className="text-right flex items-center gap-3">
                                            <span className="font-mono text-sm text-slate-600">{Number(stock.ltp).toFixed(2)}</span>
                                            <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+{Number(stock.percentage_change).toFixed(2)}%</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Losers */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
                                <TrendingDown className="w-4 h-4 text-rose-600" />
                            </div>
                            <span className="text-slate-900">{t.dashboard.losers}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {topLosers.length === 0 ? (
                                <div className="text-sm text-slate-400 py-6 text-center">{t.dashboard.noDataYet}</div>
                            ) : (
                                topLosers.map((stock) => (
                                    <Link to={`/stock/${stock.symbol}`} key={stock.symbol} className="flex justify-between items-center py-2.5 px-2 -mx-2 rounded-lg hover:bg-rose-50/50 transition-colors group">
                                        <span className="font-semibold text-sm text-slate-800 group-hover:text-rose-700 transition-colors">{stock.symbol}</span>
                                        <div className="text-right flex items-center gap-3">
                                            <span className="font-mono text-sm text-slate-600">{Number(stock.ltp).toFixed(2)}</span>
                                            <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{Number(stock.percentage_change).toFixed(2)}%</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Turnovers */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-slate-900">{t.dashboard.topTurnovers}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {topTurnovers.length === 0 ? (
                                <div className="text-sm text-slate-400 py-6 text-center">{t.dashboard.noDataYet}</div>
                            ) : (
                                topTurnovers.map((stock) => (
                                    <Link to={`/stock/${stock.symbol}`} key={stock.symbol} className="flex justify-between items-center py-2.5 px-2 -mx-2 rounded-lg hover:bg-blue-50/50 transition-colors group">
                                        <span className="font-semibold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">{stock.symbol}</span>
                                        <span className="font-mono text-sm text-slate-500">{(Number(stock.turnover) / 100000).toFixed(1)}L</span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sub-Indices */}
            {subIndices.length > 0 && (
                <div className="animate-slide-up animate-in delay-300">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.dashboard.sectorIndices}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {subIndices.map((index) => (
                            <div key={index.sector} className="bg-white rounded-xl border border-slate-200/80 p-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-default dark:bg-slate-800 dark:border-slate-700/60">
                                <div className="text-xs text-slate-500 truncate mb-1.5 font-medium group-hover:text-mero-teal transition-colors dark:text-slate-400" title={index.sector}>{index.sector}</div>
                                <div className="font-mono font-bold text-slate-900 text-sm dark:text-white">{Number(index.value).toFixed(2)}</div>
                                <div className={`font-mono text-xs mt-1 font-bold flex items-center gap-0.5 ${Number(index.change) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {Number(index.change) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {Number(index.change) > 0 ? '+' : ''}{Number(index.change).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Stocks Table */}
            <div className="animate-slide-up animate-in delay-400">
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <CardTitle className="text-slate-900 dark:text-white">{t.dashboard.liveMarketWatch}</CardTitle>
                        <input
                            type="text"
                            placeholder={t.dashboard.filterBySymbol}
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-mero-teal/50 outline-none transition-colors w-full sm:w-48 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:bg-slate-600"
                        />
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto -mx-6">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700 dark:text-slate-400">
                                        <th className="px-6 py-3 text-left font-semibold">{t.dashboard.symbol}</th>
                                        <th className="px-6 py-3 text-right font-semibold">{t.dashboard.ltpRs}</th>
                                        <th className="px-6 py-3 text-right font-semibold">{t.dashboard.change}</th>
                                        <th className="px-6 py-3 text-right font-semibold">{t.dashboard.percentChange}</th>
                                        <th className="px-6 py-3 text-right font-semibold">{t.dashboard.volume}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStocks.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                                                {loaded ? t.dashboard.noStocksMatch : t.dashboard.loadingMarketData}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStocks.map((stock) => {
                                            const change = Number(stock.point_change);
                                            const pct = Number(stock.percentage_change);
                                            const up = pct >= 0;
                                            return (
                                                <tr key={stock.symbol} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors dark:border-slate-700/50 dark:hover:bg-slate-700/30">
                                                    <td className="px-6 py-3">
                                                        <Link to={`/stock/${stock.symbol}`} className="font-semibold text-mero-teal hover:text-mero-darkTeal transition-colors">{stock.symbol}</Link>
                                                    </td>
                                                    <td className="px-6 py-3 font-mono text-right text-slate-800 dark:text-slate-200">{Number(stock.ltp).toFixed(2)}</td>
                                                    <td className={`px-6 py-3 font-mono text-right font-semibold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {change > 0 ? '+' : ''}{change.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <span className={`inline-flex items-center gap-0.5 font-mono text-xs font-bold px-2 py-0.5 rounded-full ${up ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                                                            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                            {pct > 0 ? '+' : ''}{pct.toFixed(2)}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 font-mono text-right text-slate-500">
                                                        {Number(stock.volume).toLocaleString()}
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
        </div>
    );
};

export default Dashboard;
