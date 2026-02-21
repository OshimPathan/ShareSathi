import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight, BarChart3, Shield, Zap, BookOpen, ChevronRight, Play, Users, Activity, Target } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getMarketBundle, getNews } from '../../services/db';
import { SearchableDropdown } from '../../components/ui/SearchableDropdown';
import { Footer } from '../../components/layout/Footer';
import Ticker from '../../components/domain/Ticker';
import type { Stock, MarketSummary, NewsItem } from '../../types';

/* ─── Animated counter hook ─── */
function useCountUp(end: number, duration = 2000, decimals = 0) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        if (!ref.current || started.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const start = performance.now();
                const animate = (now: number) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(parseFloat((eased * end).toFixed(decimals)));
                    if (progress < 1) requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }
        }, { threshold: 0.3 });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration, decimals]);

    return { count, ref };
}

export const Landing = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState<MarketSummary | null>(null);
    const [topGainers, setTopGainers] = useState<Stock[]>([]);
    const [topLosers, setTopLosers] = useState<Stock[]>([]);
    const [topTurnovers, setTopTurnovers] = useState<Stock[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchPublicData = async () => {
            const [bundle, newsData] = await Promise.all([
                getMarketBundle(),
                getNews(undefined, 5),
            ]);
            if (bundle) {
                setSummary(bundle.summary);
                setTopGainers(bundle.topGainers);
                setTopLosers(bundle.topLosers);
                setTopTurnovers(bundle.topTurnovers);
            }
            setNews(newsData);
        };
        fetchPublicData();
    }, []);

    const nepseIndex = summary ? Number(summary.nepse_index) : 0;
    const pctChange = summary ? Number(summary.percentage_change) : 0;
    const isPositive = pctChange >= 0;

    /* Animated stats */
    const usersCount = useCountUp(2500, 2000, 0);
    const tradesCount = useCountUp(50000, 2500, 0);
    const stocksCount = useCountUp(250, 1500, 0);

    const chartData = summary ? [
        { time: '11:00', value: nepseIndex - 20 },
        { time: '11:30', value: nepseIndex - 12 },
        { time: '12:00', value: nepseIndex + 5 },
        { time: '12:30', value: nepseIndex - 5 },
        { time: '13:00', value: nepseIndex - 15 },
        { time: '13:30', value: nepseIndex + 2 },
        { time: '14:00', value: nepseIndex + 10 },
        { time: '14:30', value: nepseIndex + 3 },
        { time: '15:00', value: nepseIndex }
    ] : [];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans selection:bg-mero-teal/20 overflow-x-hidden">

            {/* ═══ NAVBAR ═══ */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <img src="/logo.png" alt="ShareSathi" className="w-9 h-9 group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Share<span className="text-mero-teal">Sathi</span></span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <Link to="/market" className="hover:text-mero-teal transition-colors">Market</Link>
                            <Link to="/news" className="hover:text-mero-teal transition-colors">News</Link>
                            <Link to="/ipo" className="hover:text-mero-teal transition-colors">IPO</Link>
                            <Link to="/pricing" className="hover:text-mero-teal transition-colors">Pricing</Link>
                            <Link to="/about" className="hover:text-mero-teal transition-colors">About</Link>
                        </div>

                        {/* CTA */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="w-48 text-black">
                                <SearchableDropdown
                                    value=""
                                    onChange={(symbol) => { if (symbol) navigate(`/stock/${symbol}`); }}
                                    placeholder="Search stocks..."
                                />
                            </div>
                            <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-600 hover:text-mero-teal transition-colors px-3 py-2 dark:text-slate-300">
                                Sign In
                            </button>
                            <button
                                onClick={() => navigate('/login', { state: { register: true } })}
                                className="bg-mero-teal hover:bg-mero-darkTeal text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-mero-teal/25 active:scale-95"
                            >
                                Get Started Free
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div className="w-5 h-5 flex flex-col justify-center gap-1">
                                <span className={`block h-0.5 w-full bg-slate-600 dark:bg-slate-300 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                                <span className={`block h-0.5 w-full bg-slate-600 dark:bg-slate-300 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                                <span className={`block h-0.5 w-full bg-slate-600 dark:bg-slate-300 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                            </div>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-slate-200/50 dark:border-slate-700/50 animate-slide-down">
                            <div className="flex flex-col gap-2">
                                {[{ to: '/market', label: 'Market' }, { to: '/news', label: 'News' }, { to: '/ipo', label: 'IPO' }, { to: '/pricing', label: 'Pricing' }].map(item => (
                                    <Link key={item.to} to={item.to} className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-mero-teal hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">{item.label}</Link>
                                ))}
                                <div className="flex gap-2 mt-2 px-3">
                                    <button onClick={() => navigate('/login')} className="flex-1 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 py-2.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">Sign In</button>
                                    <button onClick={() => navigate('/login', { state: { register: true } })} className="flex-1 bg-mero-teal text-white text-sm font-semibold py-2.5 rounded-full">Get Started</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* ═══ HERO SECTION ═══ */}
            <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
                <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-mero-teal/5 rounded-full blur-[128px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-mero-orange/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #238b96 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left - Copy */}
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-mero-teal/10 text-mero-teal text-sm font-medium rounded-full mb-6 animate-fade-in">
                                <Activity className="w-4 h-4" />
                                Live NEPSE Data · Paper Trading
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] animate-slide-up">
                                Master NEPSE
                                <br />
                                <span className="text-gradient">Risk-Free</span>
                            </h1>
                            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed animate-slide-up delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                                Practice trading on Nepal Stock Exchange with <strong>real market data</strong> and <strong>Rs. 10,00,000</strong> virtual money. Build confidence before investing real capital.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4 mt-8 animate-slide-up delay-300" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                                <button
                                    onClick={() => navigate('/login', { state: { register: true } })}
                                    className="group bg-mero-teal hover:bg-mero-darkTeal text-white font-semibold px-7 py-3.5 rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-mero-teal/20 active:scale-95 flex items-center gap-2"
                                >
                                    Start Trading Free
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate('/market')}
                                    className="group border-2 border-slate-200 dark:border-slate-700 hover:border-mero-teal/30 text-slate-700 dark:text-slate-300 font-semibold px-7 py-3.5 rounded-full transition-all duration-300 hover:bg-mero-teal/5 flex items-center gap-2"
                                >
                                    <Play className="w-4 h-4" />
                                    View Live Market
                                </button>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-10 flex items-center gap-6 animate-fade-in delay-500" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                                <div className="flex -space-x-2">
                                    {['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'].map((bg, i) => (
                                        <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                    ))}
                                </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">2,500+</span> traders learning NEPSE
                                </div>
                            </div>
                        </div>

                        {/* Right - Live Market Card */}
                        <div className="animate-scale-in delay-300" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                            <div className="relative">
                                {/* Glow effect */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-mero-teal/20 via-transparent to-mero-orange/20 rounded-3xl blur-2xl opacity-60 animate-pulse-soft" />

                                <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/80 dark:border-slate-700/60 overflow-hidden">
                                    {/* Card Header */}
                                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">NEPSE Index</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Nepal Stock Exchange · Live</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                                                {nepseIndex > 0 ? nepseIndex.toFixed(2) : '---'}
                                            </div>
                                            <div className={`text-sm font-mono font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {pctChange !== 0 && (isPositive ? '+' : '')}{pctChange.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mini Chart */}
                                    <div className="h-48 px-2">
                                        {chartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.2} />
                                                            <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="time" hide />
                                                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '13px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                                    <Area type="monotone" dataKey="value" stroke={isPositive ? '#10b981' : '#f43f5e'} strokeWidth={2.5} fill="url(#heroGradient)" dot={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <div className="w-8 h-8 border-2 border-mero-teal/30 border-t-mero-teal rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Turnover</p>
                                            <p className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                                                {summary ? `${(Number(summary.total_turnover) / 10000000).toFixed(1)}Cr` : '---'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Volume</p>
                                            <p className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                                                {summary ? Number(summary.total_traded_shares).toLocaleString() : '---'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                                            <p className={`text-sm font-bold ${summary?.market_status === 'Open' ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                {summary?.market_status || '---'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ TICKER ═══ */}
            <Ticker />

            {/* ═══ STATS BAR ═══ */}
            <section className="py-12 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200/50 dark:border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { ref: usersCount.ref, value: usersCount.count.toLocaleString(), suffix: '+', label: 'Active Traders', icon: Users },
                            { ref: tradesCount.ref, value: tradesCount.count.toLocaleString(), suffix: '+', label: 'Paper Trades', icon: BarChart3 },
                            { ref: stocksCount.ref, value: stocksCount.count.toLocaleString(), suffix: '+', label: 'NEPSE Stocks', icon: Target },
                            { ref: null, value: '₹10L', suffix: '', label: 'Virtual Capital', icon: Zap },
                        ].map((stat, i) => (
                            <div key={i} ref={stat.ref} className="text-center group">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-mero-teal/10 text-mero-teal mb-3 group-hover:scale-110 transition-transform duration-300">
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                                    {stat.value}<span className="text-mero-teal">{stat.suffix}</span>
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section className="py-20 lg:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-mero-teal/10 text-mero-teal text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">
                            Why ShareSathi
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Everything you need to
                            <br />
                            <span className="text-gradient-teal">learn stock trading</span>
                        </h2>
                        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                            No risk. Real data. Full experience.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Activity, title: 'Live NEPSE Data', desc: 'Real-time prices, indices, and market depth straight from Nepal Stock Exchange.', color: 'bg-emerald-50 text-emerald-600' },
                            { icon: BarChart3, title: 'Paper Trading', desc: 'Practice with Rs. 10,00,000 virtual money. Execute buy/sell orders at live prices.', color: 'bg-blue-50 text-blue-600' },
                            { icon: Shield, title: 'Risk Free', desc: 'No real money, no risk. Make mistakes, learn from them, grow your skills.', color: 'bg-purple-50 text-purple-600' },
                            { icon: Zap, title: 'Accurate Fees', desc: 'NEPSE brokerage tiers, SEBON fee, and DP charges calculated exactly.', color: 'bg-amber-50 text-amber-600' },
                            { icon: BookOpen, title: 'Portfolio Tracker', desc: 'Monitor holdings, P&L, sector allocation with beautiful charts.', color: 'bg-rose-50 text-rose-600' },
                            { icon: Target, title: 'Watchlist & Alerts', desc: 'Track your favorite stocks with target price and stop-loss alerts.', color: 'bg-teal-50 text-teal-600' },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-6 hover-lift cursor-default"
                            >
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ LIVE MARKET DATA ═══ */}
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                {/* Background orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-mero-teal/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-mero-orange/10 rounded-full blur-[80px]" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Live Market Pulse</h2>
                            <p className="mt-2 text-slate-400">Real-time data from Nepal Stock Exchange</p>
                        </div>
                        <Link to="/market" className="mt-4 md:mt-0 inline-flex items-center gap-1 text-mero-teal hover:text-mero-teal/80 font-medium text-sm transition-colors">
                            View Full Market <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {!summary ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-6 animate-pulse h-72" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Top Gainers */}
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/[0.08] transition-colors duration-300">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <h3 className="font-bold text-white">Top Gainers</h3>
                                </div>
                                <div className="space-y-3">
                                    {topGainers.slice(0, 5).map((stock, idx) => (
                                        <Link to={`/stock/${stock.symbol}`} key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/5 -mx-2 px-2 rounded-lg transition-colors">
                                            <div>
                                                <span className="font-semibold text-white text-sm">{stock.symbol}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-sm text-slate-300">{Number(stock.ltp).toFixed(2)}</div>
                                                <div className="font-mono text-xs font-bold text-emerald-400">+{Number(stock.percentage_change).toFixed(2)}%</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Link to="/market/gainers" className="mt-4 inline-flex items-center gap-1 text-xs text-mero-teal hover:underline font-medium">
                                    View all <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>

                            {/* Top Losers */}
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/[0.08] transition-colors duration-300">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                                        <TrendingDown className="w-4 h-4 text-rose-400" />
                                    </div>
                                    <h3 className="font-bold text-white">Top Losers</h3>
                                </div>
                                <div className="space-y-3">
                                    {topLosers.slice(0, 5).map((stock, idx) => (
                                        <Link to={`/stock/${stock.symbol}`} key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/5 -mx-2 px-2 rounded-lg transition-colors">
                                            <div>
                                                <span className="font-semibold text-white text-sm">{stock.symbol}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-sm text-slate-300">{Number(stock.ltp).toFixed(2)}</div>
                                                <div className="font-mono text-xs font-bold text-rose-400">{Number(stock.percentage_change).toFixed(2)}%</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Link to="/market/losers" className="mt-4 inline-flex items-center gap-1 text-xs text-mero-teal hover:underline font-medium">
                                    View all <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>

                            {/* Top Turnovers */}
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/[0.08] transition-colors duration-300">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <BarChart3 className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <h3 className="font-bold text-white">Top Turnovers</h3>
                                </div>
                                <div className="space-y-3">
                                    {topTurnovers.slice(0, 5).map((stock, idx) => (
                                        <Link to={`/stock/${stock.symbol}`} key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/5 -mx-2 px-2 rounded-lg transition-colors">
                                            <div>
                                                <span className="font-semibold text-white text-sm">{stock.symbol}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-sm text-slate-300">{Number(stock.ltp).toFixed(2)}</div>
                                                <div className="font-mono text-xs text-blue-400">{(Number(stock.turnover) / 100000).toFixed(1)}L</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Link to="/market/turnovers" className="mt-4 inline-flex items-center gap-1 text-xs text-mero-teal hover:underline font-medium">
                                    View all <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ NEWS SECTION ═══ */}
            {news.length > 0 && (
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Latest Market News</h2>
                                <p className="mt-1 text-slate-500 dark:text-slate-400">Stay informed with live-scraped financial news</p>
                            </div>
                            <Link to="/news" className="hidden md:inline-flex items-center gap-1 text-mero-teal hover:underline font-medium text-sm">
                                All News <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {news.slice(0, 3).map((item, i) => (
                                <a key={i} href={item.url ?? '#'} target="_blank" rel="noopener noreferrer" className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden hover-lift">
                                    <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                                        <BarChart3 className="w-12 h-12 text-slate-300 group-hover:text-mero-teal/50 transition-colors" />
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-semibold text-mero-teal bg-mero-teal/10 px-2 py-0.5 rounded-full">{item.category || 'Market'}</span>
                                            <span className="text-xs text-slate-400">{item.source}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-mero-teal transition-colors leading-snug">{item.title}</h3>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ CTA SECTION ═══ */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-3xl overflow-hidden">
                        {/* Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-mero-teal via-mero-darkTeal to-slate-900" />
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                        <div className="relative px-8 py-16 sm:px-16 text-center">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                                Ready to start your
                                <br />
                                trading journey?
                            </h2>
                            <p className="mt-4 text-lg text-white/70 max-w-lg mx-auto">
                                Join thousands of Nepali traders practicing on ShareSathi. Free forever, no credit card required.
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-4">
                                <button
                                    onClick={() => navigate('/login', { state: { register: true } })}
                                    className="group bg-white text-mero-darkTeal font-bold px-8 py-4 rounded-full hover:bg-slate-50 transition-all duration-300 hover:shadow-xl active:scale-95 flex items-center gap-2"
                                >
                                    Create Free Account
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate('/market')}
                                    className="border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300"
                                >
                                    Explore Market
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Landing;
