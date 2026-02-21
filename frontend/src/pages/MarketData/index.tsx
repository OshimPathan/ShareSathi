import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const MarketDataPage = () => {
    const { type } = useParams<{ type: string }>();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/market/summary');
                const summaryData = res.data.data || res.data;

                if (type === 'gainers') {
                    setData(summaryData.topGainers || []);
                } else if (type === 'losers') {
                    setData(summaryData.topLosers || []);
                } else if (type === 'turnovers') {
                    setData(summaryData.topTurnovers || []);
                }

                setLastUpdated(new Date().toISOString().slice(0, 10).replace(/-/g, '/'));
            } catch (error) {
                console.error("Failed to fetch market data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Polling every 10 seconds for live updates
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [type]);

    const getTitle = () => {
        switch (type) {
            case 'gainers': return 'Top Gainers';
            case 'losers': return 'Top Losers';
            case 'turnovers': return 'Top Turnovers';
            default: return 'Market Data';
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-slate-800 font-sans selection:bg-mero-teal/20">
            <Navbar />

            <main className="flex-1 w-full py-8 px-4 md:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <Link to="/" className="text-slate-500 hover:text-mero-teal text-sm flex items-center gap-1 mb-2 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to Home
                            </Link>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-800">{getTitle()}</h1>
                            <p className="text-slate-500 mt-1">Live updates from the Nepal Stock Exchange</p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-mero-teal text-white flex justify-between items-center px-6 py-3 border-b border-mero-darkTeal">
                            <h3 className="font-bold tracking-wide uppercase">{getTitle()}</h3>
                            <span className="bg-mero-orange text-white text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-sm shadow-sm">
                                As of {lastUpdated || '...'}
                            </span>
                        </div>

                        <div className="w-full">
                            {loading && data.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">Loading market data...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 font-bold">Symbol</th>
                                                <th className="px-6 py-4 text-right font-bold">LTP (Rs)</th>
                                                {type === 'turnovers' ? (
                                                    <th className="px-6 py-4 text-right font-bold">Turnover</th>
                                                ) : (
                                                    <th className="px-6 py-4 text-right font-bold">% Change</th>
                                                )}
                                                <th className="px-6 py-4 text-right font-bold hidden sm:table-cell">Point Change</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.map((stock: any, idx: number) => (
                                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-3 font-bold text-blue-700 hover:underline cursor-pointer">{stock.symbol}</td>
                                                    <td className="px-6 py-3 font-mono text-right font-medium text-slate-800">{stock.ltp?.toFixed(2) || '0.00'}</td>

                                                    {type === 'turnovers' ? (
                                                        <td className="px-6 py-3 font-mono text-right text-slate-600">
                                                            {(stock.turnover / 100000).toLocaleString(undefined, { maximumFractionDigits: 2 })} Lakhs
                                                        </td>
                                                    ) : (
                                                        <td className={`px-6 py-3 font-mono text-right font-bold ${type === 'gainers' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            <div className="flex items-center justify-end gap-1">
                                                                {type === 'gainers' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                                {stock.percentageChange?.toFixed(2) || '0.00'}%
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-3 font-mono text-right text-slate-500 hidden sm:table-cell">
                                                        {stock.pointChange > 0 ? '+' : ''}{stock.pointChange?.toFixed(2) || '0.00'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {data.length === 0 && !loading && (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">No data available for {getTitle()}.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MarketDataPage;
