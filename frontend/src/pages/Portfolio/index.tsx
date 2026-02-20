import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import api from "../../services/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

interface Asset {
    symbol: string;
    quantity: number;
    average_buy_price: number;
    current_price: number;
    investment: number;
    current_value: number;
    pnl: number;
    pnl_percentage: number;
}

interface PortfolioSummary {
    total_investment: number;
    total_current_value: number;
    total_pnl: number;
    overall_pnl_percentage: number;
}

export const Portfolio = () => {
    const [balance, setBalance] = useState<number>(0);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [summary, setSummary] = useState<PortfolioSummary>({
        total_investment: 0,
        total_current_value: 0,
        total_pnl: 0,
        overall_pnl_percentage: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [walletRes, portfolioRes] = await Promise.all([
                api.get("/portfolio/wallet"),
                api.get("/portfolio")
            ]);
            setBalance(walletRes.data.balance);
            setAssets(portfolioRes.data.assets);
            setSummary(portfolioRes.data.summary);
        } catch (error) {
            // Ignore error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatCurrency = (val: number) => `Rs. ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatPercent = (val: number) => `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;

    // Calculate Sector Allocation
    const sectorMap: Record<string, number> = {};
    assets.forEach(asset => {
        const sector = (asset as any).sector || "Others";
        sectorMap[sector] = (sectorMap[sector] || 0) + asset.current_value;
    });

    const sectorData = Object.keys(sectorMap).map(key => ({
        name: key,
        value: sectorMap[key]
    })).sort((a, b) => b.value - a.value);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#84cc16'];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Portfolio</h1>
                    <p className="text-sm text-slate-400 mt-1">Simulated investments & P&L</p>
                </div>
                {isLoading && <div className="text-sm text-blue-400 animate-pulse">Syncing data...</div>}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Available Cash</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono text-blue-400">{formatCurrency(balance)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Total Invested</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{formatCurrency(summary.total_investment)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Current Value</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{formatCurrency(summary.total_current_value)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Lifetime P&L</CardTitle></CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold font-mono ${summary.total_pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {summary.total_pnl > 0 ? '+' : ''}{formatCurrency(summary.total_pnl)}
                        </div>
                        <p className={`text-xs mt-1 ${summary.overall_pnl_percentage >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {summary.overall_pnl_percentage > 0 ? '↑' : '↓'} {formatPercent(summary.overall_pnl_percentage)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Current Holdings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-3">Symbol</th>
                                        <th className="px-6 py-3 text-right">Qty</th>
                                        <th className="px-6 py-3 text-right">Avg Price</th>
                                        <th className="px-6 py-3 text-right">LTP</th>
                                        <th className="px-6 py-3 text-right">P&L</th>
                                        <th className="px-6 py-3 text-right">ROI %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                                                {isLoading ? "Loading holdings..." : "No stocks in portfolio yet. Head over to Trading to buy!"}
                                            </td>
                                        </tr>
                                    ) : (
                                        assets.map((asset) => (
                                            <tr key={asset.symbol} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                                <td className="px-6 py-4 font-bold text-blue-400">
                                                    <div>{asset.symbol}</div>
                                                    <div className="text-xs font-normal text-slate-500">{(asset as any).sector}</div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-right">{asset.quantity.toLocaleString()}</td>
                                                <td className="px-6 py-4 font-mono text-right">{asset.average_buy_price.toFixed(2)}</td>
                                                <td className="px-6 py-4 font-mono text-right">{asset.current_price.toFixed(2)}</td>
                                                <td className={`px-6 py-4 font-mono text-right ${asset.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {asset.pnl > 0 ? '+' : ''}{asset.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className={`px-6 py-4 font-mono text-right ${asset.pnl_percentage >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {formatPercent(asset.pnl_percentage)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sector Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {assets.length === 0 ? (
                            <div className="text-sm text-slate-500 text-center py-8">
                                {isLoading ? "Analyzing allocation..." : "Buy stocks to chart allocation"}
                            </div>
                        ) : (
                            <div className="h-[300px] w-full mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={sectorData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={95}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {sectorData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: any) => formatCurrency(Number(value))}
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                                            itemStyle={{ color: '#e2e8f0' }}
                                        />
                                        <Legend
                                            layout="horizontal"
                                            verticalAlign="bottom"
                                            align="center"
                                            wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
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
