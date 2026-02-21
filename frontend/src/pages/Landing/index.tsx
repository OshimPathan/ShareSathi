import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { SearchableDropdown } from '../../components/ui/SearchableDropdown';
import { Footer } from '../../components/layout/Footer';
import Ticker from '../../components/domain/Ticker';
export const Landing = () => {
    const navigate = useNavigate();
    const [marketData, setMarketData] = useState<any>(null);
    const [news, setNews] = useState<any[]>([]);

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                // Fetch market summary (Gainers, Losers, etc.)
                const marketRes = await api.get('/market/summary');
                setMarketData(marketRes.data);

                // Fetch latest news
                const newsRes = await api.get('/news/latest');
                setNews(newsRes.data.news);
            } catch (error) {
                console.error("Failed to load public data", error);
            }
        };
        fetchPublicData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 font-sans selection:bg-mero-teal/20 overflow-x-hidden">

            {/* Top Orange Header Bar (Mero Lagani Style) */}
            <div className="bg-mero-orange text-white text-xs py-2 px-4 lg:px-20 hidden md:flex justify-between items-center w-full">
                <div>
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-4">
                    <a href="mailto:oshimpathan@gmail.com" className="flex items-center gap-1 hover:underline">✉ oshimpathan@gmail.com</a>
                    <span className="flex items-center gap-1">📞 (+977) 9800000000</span>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-[10px] tracking-wider transition-colors ml-2" onClick={() => alert("English Language Selected")}>ENGLISH</button>
                    <button onClick={() => navigate('/login', { state: { register: true } })} className="bg-[#238b96] hover:bg-[#1c6f78] text-white px-3 py-1 text-[10px] tracking-wider transition-colors">Create Free Account</button>
                    <button className="bg-[#60bb46] hover:bg-[#4ea037] text-white px-3 py-1 flex items-center text-[10px] tracking-wider transition-colors" onClick={() => alert("Opening Help Center...")}>HELP ▾</button>
                    <a href="/about" className="hover:underline cursor-pointer">About Us</a>
                    <a href="/contact" className="hover:underline cursor-pointer">Contact Us</a>
                </div>
            </div>

            {/* Logo Area (White Background) */}
            <div className="bg-white w-full py-4 px-4 lg:px-20 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img src="/logo.png" alt="ShareSathi Logo" className="w-12 h-12 mr-3" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold tracking-tight text-slate-800 uppercase" style={{ fontFamily: 'Arial, sans-serif' }}>SHARE SATHI</span>
                            <span className="text-xs text-slate-500 italic mt-[-2px]">For the Investor...</span>
                        </div>
                    </div>
                    {/* Mobile Only: Create Account Quick Link */}
                    <div className="md:hidden flex">
                        <button onClick={() => navigate('/login', { state: { register: true } })} className="bg-mero-teal hover:bg-mero-darkTeal text-white px-3 py-2 text-xs font-bold rounded shadow-sm">
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Navigation (Teal Background) */}
            <nav className="bg-mero-teal w-full text-white px-4 lg:px-20 flex flex-col md:flex-row justify-between items-center py-2 shadow-sm sticky top-0 z-50 gap-3 md:gap-0">
                <div className="flex items-center gap-6 text-sm font-medium w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide shrink-0">
                    <a href="#" className="hover:text-slate-200 transition-colors whitespace-nowrap">⌂</a>
                    <a href="#" className="hover:text-slate-200 transition-colors flex items-center whitespace-nowrap">Market <span className="text-[10px] ml-1 opacity-70">▼</span></a>
                    <a href="#" className="hover:text-slate-200 transition-colors flex items-center whitespace-nowrap">News <span className="text-[10px] ml-1 opacity-70">▼</span></a>
                    <a href="#" className="hover:text-slate-200 transition-colors whitespace-nowrap">Announcements</a>
                    <a href="#" className="hover:text-slate-200 transition-colors flex items-center whitespace-nowrap">Reports <span className="text-[10px] ml-1 opacity-70">▼</span></a>
                    <a href="#" className="hover:text-slate-200 transition-colors flex items-center whitespace-nowrap">Portfolio <span className="text-[10px] ml-1 opacity-70">▼</span></a>
                    <a href="#" className="hover:text-slate-200 transition-colors flex items-center whitespace-nowrap">IPO <span className="text-[10px] ml-1 opacity-70">▼</span></a>
                    <a href="#" className="hover:text-slate-200 transition-colors whitespace-nowrap">Services</a>
                    <button onClick={() => navigate('/dashboard')} className="font-bold relative flex items-center whitespace-nowrap">
                        Dashboard
                        <span className="absolute -top-3 -right-6 bg-mero-orange text-white text-[10px] px-1 rounded shadow-sm">New</span>
                    </button>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
                    <div className="flex bg-white rounded overflow-hidden w-full md:w-64">
                        <div className="flex-1 w-full text-black">
                            <SearchableDropdown
                                value=""
                                onChange={(symbol) => {
                                    if (symbol) window.location.href = `/trade?symbol=${symbol}`;
                                }}
                                placeholder="Search symbol..."
                            />
                        </div>
                        <button className="bg-mero-orange text-white px-3 hover:bg-opacity-90 transition-colors border-l border-mero-orange/20 shrink-0">
                            🔍
                        </button>
                    </div>

                    {/* Desktop Login Button */}
                    <button onClick={() => navigate('/login')} className="hidden md:flex items-center gap-1 font-medium hover:text-slate-200 transition-colors text-sm ml-2 whitespace-nowrap">
                        👤 Log In
                    </button>
                </div>
            </nav>

            {/* Main Content Area Container */}
            <Ticker />

            <div className="container mx-auto max-w-7xl px-4 lg:px-20 py-6">

                {/* Hero / Banner Area (Mero Lagani 3-Column Style) */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Main Headline & Image (Col Span 2) */}
                    <div className="lg:col-span-2 flex flex-col">
                        <h1 className="text-2xl font-bold text-mero-teal leading-snug mb-3 hover:text-mero-darkTeal hover:underline cursor-pointer">
                            {news.length > 0 ? news[0].title : "सुनको मूल्य उच्च रफ्तारमा बढ्ने क्रम रोकियो, यो साता तोलामा १,२०० रुपैयाँले बढेको सुन आगामी साता के होला?"}
                        </h1>
                        <div className="w-full bg-slate-900 aspect-video relative overflow-hidden group border border-slate-200 shadow-sm cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                            <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200" alt="Gold Investment" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute bottom-4 left-4 z-20 text-white">
                                <span className="text-xs bg-red-600 px-2 py-1 font-bold mb-2 inline-block">Market Analysis</span>
                                <p className="text-sm font-medium opacity-90">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    {/* Side Ads / Promos (Col Span 1) */}
                    <div className="space-y-4 flex flex-col">
                        <div className="bg-slate-50 border border-slate-200 p-4 shadow-sm h-[180px] flex items-center justify-center font-bold text-center group cursor-pointer overflow-hidden relative">
                            <div className="absolute inset-0 bg-blue-900 text-white flex flex-col items-center justify-center p-4">
                                <span className="text-xl mb-2">नेपाल इन्भेष्टमेण्ट बैंक</span>
                                <span className="text-xs font-normal">सुरक्षित र भरपर्दो</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-4 shadow-sm h-[180px] flex items-center justify-center font-bold text-center group cursor-pointer overflow-hidden relative">
                            <div className="absolute inset-0 bg-pink-600 text-white flex flex-col items-center justify-center p-4">
                                <span className="text-lg mb-2">नारी सुरक्षा जीवन बीमा योजना</span>
                                <span className="bg-white text-pink-600 px-3 py-1 rounded-full text-xs">थप जानकारीको लागि</span>
                            </div>
                        </div>
                    </div>
                </div>

                {!marketData ? (
                    <div className="h-64 border border-slate-200 rounded bg-white flex items-center justify-center text-slate-500 animate-pulse">
                        Loading market data...
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Mid Section: Mero Lagani Market Overview Chart */}
                        <div className="bg-white border border-slate-200 border-t-4 border-t-mero-teal shadow-sm">
                            <div className="bg-mero-teal text-white px-4 py-2 inline-block font-bold text-sm tracking-wide -mt-1 ml-4 rounded-b">
                                Market Overview
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <h3 className="text-sm font-bold text-slate-700">Nepal Stock Exchange Limited · 1D</h3>
                                    <span className="bg-slate-100 text-slate-800 font-mono font-bold px-2 py-1 text-sm border border-slate-200 rounded">
                                        {marketData.summary.nepseIndex.toFixed(2)}
                                    </span>
                                    <span className={`font-bold font-mono text-sm ${marketData.summary?.percentageChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {marketData.summary?.percentageChange > 0 ? '+' : ''}{marketData.summary?.percentageChange?.toFixed(2) || '0.00'}%
                                    </span>
                                </div>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={[
                                                { time: '11:00', value: marketData.summary.nepseIndex - 20 },
                                                { time: '12:00', value: marketData.summary.nepseIndex + 5 },
                                                { time: '13:00', value: marketData.summary.nepseIndex - 15 },
                                                { time: '14:00', value: marketData.summary.nepseIndex + 10 },
                                                { time: '15:00', value: marketData.summary.nepseIndex }
                                            ]}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                            <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} orientation="right" dx={10} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                            />
                                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section: Mero Lagani Data Tables Grid */}
                        <div className="grid lg:grid-cols-2 gap-x-8 gap-y-6">

                            {/* Top Turnovers */}
                            <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
                                <div className="bg-mero-teal text-white flex justify-between items-center px-4 py-2 border-b border-mero-darkTeal">
                                    <h3 className="font-bold text-sm tracking-wide">Top Turnovers</h3>
                                    <span className="bg-mero-orange text-white text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-sm shadow-sm">
                                        As of {new Date().toISOString().slice(0, 10).replace(/-/g, '/')}
                                    </span>
                                </div>
                                <div className="w-full">
                                    <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 py-2 px-4 uppercase">
                                        <div>Symbol</div>
                                        <div className="text-right">Turnover</div>
                                        <div className="text-right">LTP</div>
                                    </div>
                                    {marketData.topTurnovers?.slice(0, 5).map((stock: any, idx: number) => (
                                        <div key={idx} className={`grid grid-cols-3 text-sm py-2 px-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors`}>
                                            <div className="font-bold text-blue-600 hover:underline cursor-pointer">{stock.symbol}</div>
                                            <div className="text-right font-mono text-slate-800">{(stock.turnover / 100000).toLocaleString(undefined, { maximumFractionDigits: 2 })} Lakhs</div>
                                            <div className="text-right font-mono font-medium text-slate-800">{stock.ltp?.toFixed(2) || '0.00'}</div>
                                        </div>
                                    ))}
                                    <Link to="/market/turnovers" className="block w-full text-center py-2.5 text-xs font-bold text-mero-teal hover:bg-slate-50 hover:text-mero-darkTeal border-t border-slate-100 transition-colors uppercase tracking-wider">
                                        View All Turnovers &rarr;
                                    </Link>
                                </div>
                            </div>

                            {/* Top Gainers */}
                            <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
                                <div className="bg-mero-teal text-white flex justify-between items-center px-4 py-2 border-b border-mero-darkTeal">
                                    <h3 className="font-bold text-sm tracking-wide">Top Gainers</h3>
                                    <span className="bg-mero-orange text-white text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-sm shadow-sm">
                                        As of {new Date().toISOString().slice(0, 10).replace(/-/g, '/')}
                                    </span>
                                </div>
                                <div className="w-full">
                                    <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 py-2 px-4 uppercase">
                                        <div>Symbol</div>
                                        <div className="text-right">LTP</div>
                                        <div className="text-right">% Change</div>
                                    </div>
                                    {marketData.topGainers?.slice(0, 5).map((stock: any, idx: number) => (
                                        <div key={idx} className={`grid grid-cols-3 text-sm py-2 px-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors`}>
                                            <div className="font-bold text-blue-600 hover:underline cursor-pointer">{stock.symbol}</div>
                                            <div className="text-right font-mono text-slate-800">{stock.ltp?.toFixed(2) || '0.00'}</div>
                                            <div className="text-right font-mono font-bold text-emerald-600 flex items-center justify-end gap-1"><TrendingUp className="w-3 h-3" /> {stock.percentageChange?.toFixed(2) || '0.00'}%</div>
                                        </div>
                                    ))}
                                    <Link to="/market/gainers" className="block w-full text-center py-2.5 text-xs font-bold text-mero-teal hover:bg-slate-50 hover:text-mero-darkTeal border-t border-slate-100 transition-colors uppercase tracking-wider">
                                        View All Gainers &rarr;
                                    </Link>
                                </div>
                            </div>

                            {/* Top Losers */}
                            <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
                                <div className="bg-mero-teal text-white flex justify-between items-center px-4 py-2 border-b border-mero-darkTeal">
                                    <h3 className="font-bold text-sm tracking-wide">Top Losers</h3>
                                    <span className="bg-mero-orange text-white text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider rounded-sm shadow-sm">
                                        As of {new Date().toISOString().slice(0, 10).replace(/-/g, '/')}
                                    </span>
                                </div>
                                <div className="w-full">
                                    <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 py-2 px-4 uppercase">
                                        <div>Symbol</div>
                                        <div className="text-right">LTP</div>
                                        <div className="text-right">% Change</div>
                                    </div>
                                    {marketData.topLosers?.slice(0, 5).map((stock: any, idx: number) => (
                                        <div key={idx} className={`grid grid-cols-3 text-sm py-2 px-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors`}>
                                            <div className="font-bold text-blue-600 hover:underline cursor-pointer">{stock.symbol}</div>
                                            <div className="text-right font-mono text-slate-800">{stock.ltp?.toFixed(2) || '0.00'}</div>
                                            <div className="text-right font-mono font-bold text-rose-600 flex items-center justify-end gap-1"><TrendingDown className="w-3 h-3" /> {stock.percentageChange?.toFixed(2) || '0.00'}%</div>
                                        </div>
                                    ))}
                                    <Link to="/market/losers" className="block w-full text-center py-2.5 text-xs font-bold text-mero-teal hover:bg-slate-50 hover:text-mero-darkTeal border-t border-slate-100 transition-colors uppercase tracking-wider">
                                        View All Losers &rarr;
                                    </Link>
                                </div>
                            </div>

                            {/* Market Summary List */}
                            <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
                                <div className="bg-mero-teal text-white flex justify-between items-center px-4 py-2 border-b border-mero-darkTeal">
                                    <h3 className="font-bold text-sm tracking-wide">Market Summary</h3>
                                </div>
                                <div className="w-full flex-col flex p-4 space-y-4">
                                    <div className="bg-white border border-slate-200 p-4 rounded shadow-sm hover:shadow-md transition-shadow">
                                        <p className="text-sm text-slate-500 mb-1 font-bold whitespace-nowrap">Total Turnover</p>
                                        <p className="text-2xl font-bold font-mono text-slate-800">Rs. {(marketData.summary?.totalTurnover || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white border border-slate-200 p-4 rounded shadow-sm hover:shadow-md transition-shadow">
                                        <p className="text-sm text-slate-500 mb-1 font-bold whitespace-nowrap">Total Volume</p>
                                        <p className="text-2xl font-bold font-mono text-slate-800">{marketData.summary?.totalVolume?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-sm font-medium text-slate-600">Market Status</span>
                                        <span className={`font-bold text-xs px-2 py-1 rounded ${marketData.marketStatus === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>{marketData.marketStatus}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </div>

            <Footer />
        </div>
    );
};

export default Landing;
