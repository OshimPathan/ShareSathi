import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wallet, TrendingUp, DollarSign, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { getWallet, getPortfolio } from "../../services/db";
import type { PortfolioAsset, PortfolioSummary } from "../../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

export const Portfolio = () => {
    const [balance, setBalance] = useState<number>(0);
    const [assets, setAssets] = useState<PortfolioAsset[]>([]);
    const [summary, setSummary] = useState<PortfolioSummary>({
        total_investment: 0,
        total_current_value: 0,
        total_pnl: 0,
        overall_pnl_percentage: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [wallet, portfolio] = await Promise.all([
                getWallet(),
                getPortfolio()
            ]);
            setBalance(wallet?.balance ?? 0);
            setAssets(portfolio.assets);
            setSummary(portfolio.summary);
        } catch (err: any) {
            setError(err?.message || "Failed to load portfolio data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatCurrency = (val: number) => `Rs. ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatPercent = (val: number) => `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;

    const sectorMap: Record<string, number> = {};
    assets.forEach(asset => {
        const sector = asset.sector || "Others";
        sectorMap[sector] = (sectorMap[sector] || 0) + asset.current_value;
    });

    const sectorData = Object.keys(sectorMap).map(key => ({
        name: key,
        value: sectorMap[key]
    })).sort((a, b) => b.value - a.value);

    const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#84cc16'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-up">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Portfolio</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Your simulated investments &amp; performance</p>
                </div>
                {isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-mero-teal"><RefreshCw className="w-4 h-4 animate-spin" /> Syncing...</div>
                ) : (
                    <button onClick={fetchData} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-mero-teal px-3 py-1.5 rounded-lg border border-slate-200 hover:border-mero-teal/30 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                )}
            </header>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex justify-between items-center">
                    <span className="text-sm">{error}</span>
                    <button onClick={fetchData} className="text-sm font-semibold text-rose-600 hover:underline ml-4">Retry</button>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up delay-100" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Wallet className="w-4 h-4 text-blue-600" /></div>
                        <span className="text-xs text-blue-600 font-semibold">Cash</span>
                    </div>
                    <div className="text-xl font-extrabold font-mono text-slate-900">{formatCurrency(balance)}</div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><DollarSign className="w-4 h-4 text-slate-600" /></div>
                        <span className="text-xs text-slate-500 font-semibold">Invested</span>
                    </div>
                    <div className="text-xl font-extrabold font-mono text-slate-900">{formatCurrency(summary.total_investment)}</div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-200/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-purple-600" /></div>
                        <span className="text-xs text-purple-600 font-semibold">Current Value</span>
                    </div>
                    <div className="text-xl font-extrabold font-mono text-slate-900">{formatCurrency(summary.total_current_value)}</div>
                </div>
                <div className={`rounded-xl p-4 ${summary.total_pnl >= 0 ? 'bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/50' : 'bg-gradient-to-br from-rose-50 to-white border border-rose-200/50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${summary.total_pnl >= 0 ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                            {summary.total_pnl >= 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-600" /> : <ArrowDownRight className="w-4 h-4 text-rose-600" />}
                        </div>
                        <span className={`text-xs font-semibold ${summary.total_pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>P&L</span>
                    </div>
                    <div className={`text-xl font-extrabold font-mono ${summary.total_pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {summary.total_pnl > 0 ? '+' : ''}{formatCurrency(summary.total_pnl)}
                    </div>
                    <p className={`text-xs font-bold mt-0.5 ${summary.overall_pnl_percentage >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {formatPercent(summary.overall_pnl_percentage)}
                    </p>
                </div>
            </div>

            {/* Holdings + Sector Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-slate-900">Holdings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto -mx-6">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-500 uppercase border-b border-slate-200">
                                        <th className="px-6 py-3 text-left font-semibold">Symbol</th>
                                        <th className="px-6 py-3 text-right font-semibold">Qty</th>
                                        <th className="px-6 py-3 text-right font-semibold">Avg Price</th>
                                        <th className="px-6 py-3 text-right font-semibold">LTP</th>
                                        <th className="px-6 py-3 text-right font-semibold">P&L</th>
                                        <th className="px-6 py-3 text-right font-semibold">ROI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                                                {isLoading ? "Loading..." : "No holdings yet. Start trading to build your portfolio!"}
                                            </td>
                                        </tr>
                                    ) : (
                                        assets.map((asset) => {
                                            const up = asset.pnl >= 0;
                                            return (
                                                <tr key={asset.symbol} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-6 py-3.5">
                                                        <Link to={`/stock/${asset.symbol}`} className="font-semibold text-mero-teal hover:text-mero-darkTeal transition-colors">
                                                            {asset.symbol}
                                                        </Link>
                                                        {asset.sector && <div className="text-[10px] text-slate-400 mt-0.5">{asset.sector}</div>}
                                                    </td>
                                                    <td className="px-6 py-3.5 font-mono text-right text-slate-700">{asset.quantity.toLocaleString()}</td>
                                                    <td className="px-6 py-3.5 font-mono text-right text-slate-700">{asset.average_buy_price.toFixed(2)}</td>
                                                    <td className="px-6 py-3.5 font-mono text-right text-slate-800 font-semibold">{asset.current_price.toFixed(2)}</td>
                                                    <td className={`px-6 py-3.5 font-mono text-right font-semibold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {asset.pnl > 0 ? '+' : ''}{asset.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-right">
                                                        <span className={`inline-flex items-center gap-0.5 font-mono text-xs font-bold px-2 py-0.5 rounded-full ${up ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                                                            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                            {formatPercent(asset.pnl_percentage)}
                                                        </span>
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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900">
                            <PieChartIcon className="w-4 h-4 text-slate-400" />
                            Sector Allocation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {assets.length === 0 ? (
                            <div className="text-sm text-slate-400 text-center py-10">
                                {isLoading ? "Analyzing..." : "Buy stocks to see allocation"}
                            </div>
                        ) : (
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={sectorData}
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {sectorData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: any) => formatCurrency(Number(value))}
                                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                        />
                                        <Legend
                                            layout="horizontal"
                                            verticalAlign="bottom"
                                            align="center"
                                            wrapperStyle={{ fontSize: '11px', paddingTop: '16px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Portfolio;
