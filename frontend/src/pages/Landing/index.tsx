import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BarChart3, LineChart, Shield, ChevronRight, TrendingUp, TrendingDown, Newspaper } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

export const Landing = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'success' | 'error'>('idle');
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

    const handleJoinWaitlist = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setWaitlistStatus('error');
            return;
        }
        // Simulate API call to save email
        setTimeout(() => {
            setWaitlistStatus('success');
            setEmail('');
        }, 600);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen" />
            </div>

            <div className="relative z-10">
                <nav className="container mx-auto px-6 py-6 flex justify-between items-center bg-slate-900/50 backdrop-blur-md rounded-b-2xl border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                        <img src="/logo.png" alt="ShareSathi Logo" className="w-8 h-8 rounded bg-white p-0.5" />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">ShareSathi</span>
                    </div>
                    <div>
                        <Button variant="secondary" className="mr-4 border-slate-700 hover:bg-slate-800 text-slate-200" onClick={() => navigate('/login')}>Login</Button>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white" onClick={() => navigate('/login')}>Open App</Button>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="container mx-auto px-6 py-20 lg:py-32 text-center">
                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8">
                        Master the NEPSE <br className="hidden lg:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Without the Risk</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
                        ShareSathi is an AI-powered stock analytics and paper trading simulation platform built specifically for the Nepal Stock Exchange.
                    </p>

                    <form onSubmit={handleJoinWaitlist} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email to join waitlist"
                            className="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button type="submit" size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 whitespace-nowrap">
                            Join Waitlist <ChevronRight className="w-4 h-4 ml-2 inline" />
                        </Button>
                    </form>
                    {waitlistStatus === 'success' && <p className="text-emerald-400 mt-4 text-sm font-medium animate-pulse">🎉 You're on the list! We'll notify you soon.</p>}
                    {waitlistStatus === 'error' && <p className="text-rose-400 mt-4 text-sm font-medium">Please enter a valid email address.</p>}
                </section>

                <section className="container mx-auto px-6 py-10">
                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                        {/* Live Market Overview Column (2/3 width) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                    Live Market Overview
                                </h2>
                                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1 animate-pulse">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> LIVE
                                </span>
                            </div>

                            {!marketData ? (
                                <div className="h-64 border border-slate-800 rounded-xl bg-slate-900/50 flex items-center justify-center text-slate-500 animate-pulse">
                                    Loading market data...
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* NEPSE Index Highlight */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                                            <p className="text-sm text-slate-400 mb-1">NEPSE Index</p>
                                            <p className="text-3xl font-bold font-mono text-emerald-400">{marketData.summary.nepseIndex.toFixed(2)}</p>
                                            <p className="text-xs text-emerald-500 mt-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Market Open</p>
                                        </div>
                                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                                            <p className="text-sm text-slate-400 mb-1">Total Turnover</p>
                                            <p className="text-2xl font-bold font-mono text-white">Rs. {(marketData.summary.totalTurnover / 10000000).toFixed(2)} Cr</p>
                                        </div>
                                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
                                            <p className="text-sm text-slate-400 mb-1">Total Volume</p>
                                            <p className="text-2xl font-bold font-mono text-white">{marketData.summary.totalTradedShares.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Gainers and Losers */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Gainers */}
                                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                                            <h3 className="text-emerald-400 font-bold mb-4 flex items-center pb-2 border-b border-slate-800"><TrendingUp className="w-4 h-4 mr-2" /> Top Gainers</h3>
                                            <div className="space-y-3">
                                                {marketData.topGainers.slice(0, 4).map((stock: any) => (
                                                    <div key={stock.symbol} className="flex justify-between items-center bg-slate-800/30 p-2 rounded">
                                                        <span className="font-bold">{stock.symbol}</span>
                                                        <div className="text-right">
                                                            <div className="font-mono text-sm">{stock.ltp.toFixed(2)}</div>
                                                            <div className="text-emerald-500 font-mono text-xs">+{stock.percentageChange.toFixed(2)}%</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Losers */}
                                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                                            <h3 className="text-rose-400 font-bold mb-4 flex items-center pb-2 border-b border-slate-800"><TrendingDown className="w-4 h-4 mr-2" /> Top Losers</h3>
                                            <div className="space-y-3">
                                                {marketData.topLosers.slice(0, 4).map((stock: any) => (
                                                    <div key={stock.symbol} className="flex justify-between items-center bg-slate-800/30 p-2 rounded">
                                                        <span className="font-bold">{stock.symbol}</span>
                                                        <div className="text-right">
                                                            <div className="font-mono text-sm">{stock.ltp.toFixed(2)}</div>
                                                            <div className="text-rose-500 font-mono text-xs">{stock.percentageChange.toFixed(2)}%</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recent News Column (1/3 width) */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Newspaper className="w-5 h-5 text-slate-300" />
                                    Latest News
                                </h2>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-[450px] flex flex-col relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-emerald-500/5 before:to-transparent before:pointer-events-none">
                                <div className="p-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur">
                                    <p className="text-xs text-slate-400 font-medium">Headlines from NEPSE & Economy</p>
                                </div>
                                <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar flex-1">
                                    {news.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-slate-500 animate-pulse text-sm">
                                            Fetching headlines...
                                        </div>
                                    ) : (
                                        news.map((item) => (
                                            <a href={item.url} key={item.id} className="block group border-b border-slate-800/50 pb-4 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${item.category === 'Corporate' ? 'bg-blue-500/20 text-blue-300' :
                                                            item.category === 'IPO' ? 'bg-purple-500/20 text-purple-300' :
                                                                item.category === 'Hydropower' ? 'bg-cyan-500/20 text-cyan-300' :
                                                                    'bg-slate-700 text-slate-300'
                                                        }`}>
                                                        {item.category}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">{item.published_at}</span>
                                                </div>
                                                <h4 className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-2 mt-2 leading-snug">
                                                    {item.title}
                                                </h4>
                                                <p className="text-[10px] text-slate-500 mt-2 font-medium">{item.source}</p>
                                            </a>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Features Section */}
                <section className="container mx-auto px-6 py-24">
                    <h2 className="text-3xl font-bold text-center mb-16">Platform Features</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                icon: <LineChart className="w-8 h-8 text-blue-400" />,
                                title: 'Real-time Market Data',
                                desc: 'Stay updated with live ticks, market depth, and NEPSE indices without manually refreshing.'
                            },
                            {
                                icon: <BarChart3 className="w-8 h-8 text-emerald-400" />,
                                title: 'Trading Simulator',
                                desc: 'Test your strategies with Rs. 100,000 in virtual funds in a simulated live environment.'
                            },
                            {
                                icon: <Shield className="w-8 h-8 text-purple-400" />,
                                title: 'AI Forecast Modeling',
                                desc: 'Machine learning predictions to assist your analysis and improve your win rate.'
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:bg-slate-800/50 hover:border-slate-700 transition-colors">
                                <div className="bg-slate-950 p-3 rounded-xl inline-block mb-6 border border-slate-800">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-200 mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-800 py-12 text-center text-slate-500">
                    <p>© {new Date().getFullYear()} ShareSathi | NEPSE Analytics. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default Landing;
