import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, BarChart3, Activity, Building2, RefreshCw } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getMarketBundle, getAllStocks, getSubIndices } from '../../services/db';
import PublicLayout from '../../components/layout/PublicLayout';
import type { Stock, MarketSummary, SubIndex } from '../../types';

type TabType = 'overview' | 'live' | 'gainers' | 'losers' | 'turnovers' | 'companies';

export const MarketPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [summary, setSummary] = useState<MarketSummary | null>(null);
    const [subIndices, setSubIndices] = useState<SubIndex[]>([]);
    const [topGainers, setTopGainers] = useState<Stock[]>([]);
    const [topLosers, setTopLosers] = useState<Stock[]>([]);
    const [topTurnovers, setTopTurnovers] = useState<Stock[]>([]);
    const [allStocks, setAllStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [companySearch, setCompanySearch] = useState('');
    const [sectorFilter, setSectorFilter] = useState('All');

    const fetchMarketData = async () => {
        try {
            const [bundle, indices, stocks] = await Promise.all([
                getMarketBundle(),
                getSubIndices(),
                getAllStocks(),
            ]);
            if (bundle) {
                setSummary(bundle.summary);
                setTopGainers(bundle.topGainers);
                setTopLosers(bundle.topLosers);
                setTopTurnovers(bundle.topTurnovers);
            }
            setSubIndices(indices);
            setAllStocks(stocks);
        } catch (error) {
            console.error('Failed to fetch market data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData();
    }, []);

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'live', label: 'Live Market', icon: <Activity className="w-4 h-4" /> },
        { id: 'gainers', label: 'Top Gainers', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'losers', label: 'Top Losers', icon: <TrendingDown className="w-4 h-4" /> },
        { id: 'turnovers', label: 'Top Turnovers', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'companies', label: 'Companies', icon: <Building2 className="w-4 h-4" /> },
    ];

    const sectors = [...new Set(allStocks.map((c) => c.sector).filter((s): s is string => !!s))].sort();
    const filteredCompanies = allStocks.filter((c) => {
        const matchSearch = companySearch === '' ||
            c.symbol?.toLowerCase().includes(companySearch.toLowerCase()) ||
            c.company_name?.toLowerCase().includes(companySearch.toLowerCase());
        const matchSector = sectorFilter === 'All' || c.sector === sectorFilter;
        return matchSearch && matchSector;
    });

    const nepseIdx = summary ? Number(summary.nepse_index) : 0;
    const chartData = summary ? [
        { time: '10:00', value: nepseIdx - 30 },
        { time: '10:30', value: nepseIdx - 15 },
        { time: '11:00', value: nepseIdx - 20 },
        { time: '11:30', value: nepseIdx + 5 },
        { time: '12:00', value: nepseIdx + 8 },
        { time: '12:30', value: nepseIdx - 5 },
        { time: '13:00', value: nepseIdx - 15 },
        { time: '13:30', value: nepseIdx + 3 },
        { time: '14:00', value: nepseIdx + 10 },
        { time: '14:30', value: nepseIdx + 5 },
        { time: '15:00', value: nepseIdx }
    ] : [];

    const pctChange = summary ? Number(summary.percentage_change) : 0;

    return (
        <PublicLayout>
            <div className="container mx-auto max-w-7xl px-4 lg:px-20 py-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Market Data</h1>
                        <p className="text-slate-500 mt-1">Real-time data from Nepal Stock Exchange (NEPSE)</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${summary?.market_status === 'Open' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-700 border border-slate-300'}`}>
                            {summary?.market_status || 'Loading...'}
                        </span>
                        <button onClick={fetchMarketData} className="text-mero-teal hover:text-mero-darkTeal transition-colors" title="Refresh">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex overflow-x-auto gap-1 mb-6 bg-white border border-slate-200 rounded-lg p-1 shadow-sm scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-mero-teal text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading && !summary ? (
                    <div className="h-64 border border-slate-200 rounded bg-white flex items-center justify-center text-slate-500 animate-pulse">
                        Loading market data...
                    </div>
                ) : (
                    <>
                        {/* Overview Tab */}
                        {activeTab === 'overview' && summary && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">NEPSE Index</p>
                                        <p className="text-2xl font-bold font-mono text-slate-800">{nepseIdx.toFixed(2)}</p>
                                        <p className={`text-sm font-mono font-bold mt-1 ${pctChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {pctChange > 0 ? '+' : ''}{pctChange.toFixed(2)}%
                                        </p>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Turnover</p>
                                        <p className="text-2xl font-bold font-mono text-blue-600">Rs. {Number(summary.total_turnover || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Volume</p>
                                        <p className="text-2xl font-bold font-mono text-slate-800">{Number(summary.total_traded_shares || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Market Status</p>
                                        <p className={`text-2xl font-bold ${summary.market_status === 'Open' ? 'text-emerald-600' : 'text-slate-600'}`}>{summary.market_status}</p>
                                    </div>
                                </div>

                                {/* NEPSE Index Chart */}
                                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                    <div className="bg-mero-teal text-white px-6 py-3 flex justify-between items-center">
                                        <h3 className="font-bold tracking-wide">NEPSE Index - Intraday</h3>
                                        <span className="text-xs bg-white/20 px-2 py-1 rounded">{new Date().toLocaleDateString()}</span>
                                    </div>
                                    <div className="p-6">
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData}>
                                                    <defs>
                                                        <linearGradient id="nepseGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#238b96" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#238b96" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                                    <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} orientation="right" />
                                                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                    <Area type="monotone" dataKey="value" stroke="#238b96" strokeWidth={2} fill="url(#nepseGradient)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Sub-Indices Grid */}
                                {subIndices.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-4">Sector Indices</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                            {subIndices.map((idx) => (
                                                <div key={idx.sector} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                                    <p className="text-xs text-slate-500 truncate mb-1 font-medium" title={idx.sector}>{idx.sector}</p>
                                                    <p className="font-mono font-bold text-slate-800">{Number(idx.value).toFixed(2)}</p>
                                                    <p className={`text-xs font-mono font-bold mt-1 ${Number(idx.change) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {Number(idx.change) > 0 ? '+' : ''}{Number(idx.change).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Gainers/Losers Tables */}
                                <div className="grid lg:grid-cols-2 gap-6">
                                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                        <div className="bg-emerald-600 text-white px-4 py-2.5 flex justify-between items-center">
                                            <h3 className="font-bold text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Top Gainers</h3>
                                            <button onClick={() => setActiveTab('gainers')} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors">View All →</button>
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase">Symbol</th>
                                                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-600 uppercase">LTP</th>
                                                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-600 uppercase">% Change</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {topGainers.slice(0, 5).map((s, i) => (
                                                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-2.5 font-bold text-blue-600"><Link to={`/stock/${s.symbol}`}>{s.symbol}</Link></td>
                                                        <td className="px-4 py-2.5 text-right font-mono">{Number(s.ltp).toFixed(2)}</td>
                                                        <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600">+{Number(s.percentage_change).toFixed(2)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                        <div className="bg-rose-600 text-white px-4 py-2.5 flex justify-between items-center">
                                            <h3 className="font-bold text-sm flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Top Losers</h3>
                                            <button onClick={() => setActiveTab('losers')} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors">View All →</button>
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-600 uppercase">Symbol</th>
                                                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-600 uppercase">LTP</th>
                                                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-600 uppercase">% Change</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {topLosers.slice(0, 5).map((s, i) => (
                                                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-2.5 font-bold text-blue-600"><Link to={`/stock/${s.symbol}`}>{s.symbol}</Link></td>
                                                        <td className="px-4 py-2.5 text-right font-mono">{Number(s.ltp).toFixed(2)}</td>
                                                        <td className="px-4 py-2.5 text-right font-mono font-bold text-rose-600">{Number(s.percentage_change).toFixed(2)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Live Market Tab */}
                        {activeTab === 'live' && (
                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in duration-300">
                                <div className="bg-mero-teal text-white px-6 py-3 flex justify-between items-center">
                                    <h3 className="font-bold tracking-wide flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live Market Watch
                                    </h3>
                                    <span className="text-xs bg-white/20 px-2 py-1 rounded">{allStocks.length} stocks</span>
                                </div>
                                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Symbol</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">LTP (Rs)</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Change</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">% Change</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase hidden sm:table-cell">Volume</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allStocks.length === 0 ? (
                                                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">Loading market data...</td></tr>
                                            ) : allStocks.map((stock, idx) => {
                                                const ptChg = Number(stock.point_change || 0);
                                                const pctChg = Number(stock.percentage_change || 0);
                                                return (
                                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-3 font-bold text-blue-700"><Link to={`/stock/${stock.symbol}`}>{stock.symbol}</Link></td>
                                                        <td className="px-6 py-3 font-mono text-right font-medium">{Number(stock.ltp).toFixed(2)}</td>
                                                        <td className={`px-6 py-3 font-mono text-right font-bold ${ptChg >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {ptChg > 0 ? '+' : ''}{ptChg.toFixed(2)}
                                                        </td>
                                                        <td className={`px-6 py-3 font-mono text-right font-bold ${pctChg >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {pctChg > 0 ? '+' : ''}{pctChg.toFixed(2)}%
                                                        </td>
                                                        <td className="px-6 py-3 font-mono text-right text-slate-500 hidden sm:table-cell">{Number(stock.volume || 0).toLocaleString()}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Gainers Tab */}
                        {activeTab === 'gainers' && (
                            <DataTable
                                title="Top Gainers"
                                titleColor="bg-emerald-600"
                                data={topGainers}
                                type="gainers"
                            />
                        )}

                        {/* Losers Tab */}
                        {activeTab === 'losers' && (
                            <DataTable
                                title="Top Losers"
                                titleColor="bg-rose-600"
                                data={topLosers}
                                type="losers"
                            />
                        )}

                        {/* Turnovers Tab */}
                        {activeTab === 'turnovers' && (
                            <DataTable
                                title="Top Turnovers"
                                titleColor="bg-blue-600"
                                data={topTurnovers}
                                type="turnovers"
                            />
                        )}

                        {/* Companies Tab */}
                        {activeTab === 'companies' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <input
                                        type="text"
                                        placeholder="Search by symbol or name..."
                                        value={companySearch}
                                        onChange={(e) => setCompanySearch(e.target.value)}
                                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-mero-teal outline-none"
                                    />
                                    <select
                                        value={sectorFilter}
                                        onChange={(e) => setSectorFilter(e.target.value)}
                                        className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-mero-teal outline-none bg-white"
                                    >
                                        <option value="All">All Sectors</option>
                                        {sectors.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                    <div className="bg-mero-teal text-white px-6 py-3 flex justify-between items-center">
                                        <h3 className="font-bold tracking-wide">Listed Companies</h3>
                                        <span className="text-xs bg-white/20 px-2 py-1 rounded">{filteredCompanies.length} companies</span>
                                    </div>
                                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                                                <tr>
                                                    <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Symbol</th>
                                                    <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Company Name</th>
                                                    <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Sector</th>
                                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">LTP</th>
                                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">% Change</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredCompanies.length === 0 ? (
                                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                                                        {allStocks.length === 0 ? 'Loading companies...' : 'No companies match your search.'}
                                                    </td></tr>
                                                ) : filteredCompanies.map((c, idx) => {
                                                    const cPct = Number(c.percentage_change || 0);
                                                    return (
                                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                            <td className="px-6 py-3 font-bold text-blue-700"><Link to={`/stock/${c.symbol}`}>{c.symbol}</Link></td>
                                                            <td className="px-6 py-3 text-slate-700">{c.company_name}</td>
                                                            <td className="px-6 py-3"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">{c.sector}</span></td>
                                                            <td className="px-6 py-3 text-right font-mono font-medium">{Number(c.ltp).toFixed(2)}</td>
                                                            <td className={`px-6 py-3 text-right font-mono font-bold ${cPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{cPct > 0 ? '+' : ''}{cPct.toFixed(2)}%</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PublicLayout>
    );
};

/* Reusable Data Table Component */
const DataTable = ({ title, titleColor, data, type }: { title: string; titleColor: string; data: Stock[]; type: string }) => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className={`${titleColor} text-white px-6 py-3 flex justify-between items-center`}>
            <h3 className="font-bold tracking-wide uppercase">{title}</h3>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
                As of {new Date().toISOString().slice(0, 10).replace(/-/g, '/')}
            </span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">#</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Symbol</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">LTP (Rs)</th>
                        {type === 'turnovers' ? (
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Turnover</th>
                        ) : (
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">% Change</th>
                        )}
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase hidden sm:table-cell">Pt Change</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No data available.</td></tr>
                    ) : data.map((stock, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="px-6 py-3 font-bold text-blue-700"><Link to={`/stock/${stock.symbol}`}>{stock.symbol}</Link></td>
                            <td className="px-6 py-3 font-mono text-right font-medium">{Number(stock.ltp).toFixed(2)}</td>
                            {type === 'turnovers' ? (
                                <td className="px-6 py-3 font-mono text-right text-slate-600">{(Number(stock.turnover) / 100000).toLocaleString(undefined, { maximumFractionDigits: 2 })} Lakhs</td>
                            ) : (
                                <td className={`px-6 py-3 font-mono text-right font-bold ${type === 'gainers' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    <span className="flex items-center justify-end gap-1">
                                        {type === 'gainers' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {Number(stock.percentage_change).toFixed(2)}%
                                    </span>
                                </td>
                            )}
                            <td className="px-6 py-3 font-mono text-right text-slate-500 hidden sm:table-cell">
                                {Number(stock.point_change || 0) > 0 ? '+' : ''}{Number(stock.point_change || 0).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default MarketPage;
