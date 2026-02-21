import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { getMarketBundle, getSubIndices } from '../../services/db';
import PublicLayout from '../../components/layout/PublicLayout';
import type { Stock, MarketSummary, SubIndex } from '../../types';

export const ReportsPage = () => {
    const [summary, setSummary] = useState<MarketSummary | null>(null);
    const [subIndices, setSubIndices] = useState<SubIndex[]>([]);
    const [topGainers, setTopGainers] = useState<Stock[]>([]);
    const [topLosers, setTopLosers] = useState<Stock[]>([]);
    const [topTurnovers, setTopTurnovers] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bundle, indices] = await Promise.all([
                    getMarketBundle(),
                    getSubIndices(),
                ]);
                if (bundle) {
                    setSummary(bundle.summary);
                    setTopGainers(bundle.topGainers);
                    setTopLosers(bundle.topLosers);
                    setTopTurnovers(bundle.topTurnovers);
                }
                setSubIndices(indices);
            } catch (error) {
                console.error("Failed to fetch market data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Prepare sector performance data for charts
    const sectorData = subIndices.map((idx) => ({
        sector: idx.sector?.length > 12 ? idx.sector.substring(0, 12) + '..' : idx.sector,
        fullName: idx.sector,
        value: Number(idx.value),
        change: Number(idx.change),
        positive: Number(idx.change) >= 0,
    }));

    const positiveSectors = sectorData.filter((s) => s.positive).length;
    const negativeSectors = sectorData.filter((s) => !s.positive).length;

    // Market breadth from gainers/losers
    const advanceDeclineRatio = topLosers.length > 0 ? (topGainers.length / topLosers.length).toFixed(2) : 'N/A';

    // Build turnover distribution
    const turnoverData = topTurnovers.slice(0, 8).map((t) => ({
        symbol: t.symbol,
        turnover: Number(t.turnover) / 100000,
    }));

    const radarData = subIndices.slice(0, 8).map((idx) => ({
        sector: idx.sector?.length > 10 ? idx.sector.substring(0, 10) : idx.sector,
        value: Math.abs(Number(idx.change)),
        fullMark: 50,
    }));

    return (
        <PublicLayout>
            <div className="container mx-auto max-w-7xl px-4 lg:px-20 py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-mero-teal" />
                        Market Reports & Analysis
                    </h1>
                    <p className="text-slate-500 mt-1">Comprehensive market insights and sector-wise analysis from NEPSE data</p>
                </div>

                {loading ? (
                    <div className="h-64 border border-slate-200 rounded-lg bg-white flex items-center justify-center text-slate-500 animate-pulse">
                        Loading market reports...
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Market Overview Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                <p className="text-xs text-slate-500 font-medium uppercase mb-1">NEPSE Index</p>
                                <p className="text-xl font-bold font-mono text-slate-800">{summary ? Number(summary.nepse_index).toFixed(2) : '--'}</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Total Turnover</p>
                                <p className="text-xl font-bold font-mono text-blue-600">Rs. {(Number(summary?.total_turnover || 0) / 10000000).toFixed(2)} Cr</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Advancing Sectors</p>
                                <p className="text-xl font-bold text-emerald-600">{positiveSectors}</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Declining Sectors</p>
                                <p className="text-xl font-bold text-rose-600">{negativeSectors}</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                <p className="text-xs text-slate-500 font-medium uppercase mb-1">A/D Ratio</p>
                                <p className="text-xl font-bold font-mono text-slate-800">{advanceDeclineRatio}</p>
                            </div>
                        </div>

                        {/* Sector Performance Chart */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                <div className="bg-mero-teal text-white px-6 py-3">
                                    <h3 className="font-bold tracking-wide">Sector-wise Performance</h3>
                                    <p className="text-xs text-white/70 mt-0.5">Point change by sector index</p>
                                </div>
                                <div className="p-6">
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={sectorData} layout="vertical" margin={{ left: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                                <YAxis dataKey="sector" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155' }} width={90} />
                                                <Tooltip
                                                    formatter={(value: any) => [Number(value).toFixed(2), 'Change']}
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                                />
                                                <Bar dataKey="change" radius={[0, 4, 4, 0]}>
                                                    {sectorData.map((entry, idx) => (
                                                        <Cell key={idx} fill={entry.positive ? '#059669' : '#e11d48'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Turnover Distribution */}
                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                <div className="bg-blue-600 text-white px-6 py-3">
                                    <h3 className="font-bold tracking-wide">Turnover Distribution</h3>
                                    <p className="text-xs text-white/70 mt-0.5">Top stocks by trading turnover (in Lakhs)</p>
                                </div>
                                <div className="p-6">
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={turnoverData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="symbol" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                                <Tooltip
                                                    formatter={(value: any) => [`${Number(value).toFixed(2)} Lakhs`, 'Turnover']}
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                                />
                                                <Bar dataKey="turnover" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sector Radar + Market Movers */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Radar Chart */}
                            {radarData.length > 0 && (
                                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                    <div className="bg-purple-600 text-white px-6 py-3">
                                        <h3 className="font-bold tracking-wide">Sector Volatility Radar</h3>
                                        <p className="text-xs text-white/70 mt-0.5">Absolute change magnitude by sector</p>
                                    </div>
                                    <div className="p-6">
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart data={radarData}>
                                                    <PolarGrid stroke="#e2e8f0" />
                                                    <PolarAngleAxis dataKey="sector" tick={{ fontSize: 10, fill: '#334155' }} />
                                                    <PolarRadiusAxis tick={{ fontSize: 10 }} />
                                                    <Radar name="Volatility" dataKey="value" stroke="#9333ea" fill="#9333ea" fillOpacity={0.3} />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Top Market Movers */}
                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                <div className="bg-amber-600 text-white px-6 py-3">
                                    <h3 className="font-bold tracking-wide">Market Movers Summary</h3>
                                    <p className="text-xs text-white/70 mt-0.5">Most impactful stocks today</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" /> Best Performers
                                        </h4>
                                        <div className="space-y-2">
                                            {topGainers.slice(0, 3).map((s, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                                                    <span className="font-bold text-slate-800">{s.symbol}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono">{Number(s.ltp).toFixed(2)}</span>
                                                        <span className="font-mono font-bold text-emerald-600">+{Number(s.percentage_change).toFixed(2)}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-rose-700 mb-2 flex items-center gap-2">
                                            <TrendingDown className="w-4 h-4" /> Worst Performers
                                        </h4>
                                        <div className="space-y-2">
                                            {topLosers.slice(0, 3).map((s, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                                                    <span className="font-bold text-slate-800">{s.symbol}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono">{Number(s.ltp).toFixed(2)}</span>
                                                        <span className="font-mono font-bold text-rose-600">{Number(s.percentage_change).toFixed(2)}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sector Detail Table */}
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-mero-teal text-white px-6 py-3">
                                <h3 className="font-bold tracking-wide">Detailed Sector Report</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">#</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Sector</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Index Value</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Change</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subIndices.map((idx, i) => (
                                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-3 text-slate-400 font-mono">{i + 1}</td>
                                                <td className="px-6 py-3 font-bold text-slate-800">{idx.sector}</td>
                                                <td className="px-6 py-3 text-right font-mono font-medium">{Number(idx.value).toFixed(2)}</td>
                                                <td className={`px-6 py-3 text-right font-mono font-bold ${Number(idx.change) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {Number(idx.change) > 0 ? '+' : ''}{Number(idx.change).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {Number(idx.change) >= 0 ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600"><TrendingUp className="w-4 h-4" /> Bullish</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-rose-600"><TrendingDown className="w-4 h-4" /> Bearish</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {subIndices.length === 0 && (
                                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">No sector data available.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Report Date */}
                        <div className="text-center text-xs text-slate-400 py-4">
                            Report generated on {new Date().toLocaleString()} · Data sourced from NEPSE via ShareSathi
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
};

export default ReportsPage;
