import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Shield, Brain, Bell, Wallet, LineChart, PieChart, ArrowRight, CheckCircle2, Zap, Activity } from 'lucide-react';
import { getMarketBundle } from '../../services/db';
import PublicLayout from '../../components/layout/PublicLayout';
import type { Stock, MarketSummary } from '../../types';

export const ServicesPage = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState<MarketSummary | null>(null);
    const [topGainers, setTopGainers] = useState<Stock[]>([]);

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const bundle = await getMarketBundle();
                if (bundle) {
                    setSummary(bundle.summary);
                    setTopGainers(bundle.topGainers);
                }
            } catch (error) {
                console.error("Failed to load market preview", error);
            }
        };
        fetchPreview();
    }, []);

    const services = [
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Real-Time Market Data",
            description: "Get live NEPSE index, stock prices, turnover, volume, and sub-indices updated in real-time directly from the Nepal Stock Exchange.",
            features: ["Live NEPSE Index tracking", "Top Gainers & Losers", "Sector-wise sub-indices", "Real-time stock ticker"],
            color: "bg-blue-600",
            lightColor: "bg-blue-50 text-blue-600 border-blue-200",
            link: "/market",
        },
        {
            icon: <Wallet className="w-8 h-8" />,
            title: "Paper Trading",
            description: "Practice stock trading with virtual money in a risk-free environment. Perfect for beginners to learn and experienced traders to test strategies.",
            features: ["Virtual portfolio with Rs. 10,00,000", "Buy & Sell at real market prices", "Track P&L in real-time", "No real money risk"],
            color: "bg-emerald-600",
            lightColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
            link: "/dashboard",
        },
        {
            icon: <PieChart className="w-8 h-8" />,
            title: "Portfolio Management",
            description: "Track your investments with detailed analytics, sector allocation, and performance metrics. Visualize your portfolio composition.",
            features: ["Sector-wise allocation chart", "Real-time portfolio valuation", "Gain/Loss tracking", "Transaction history"],
            color: "bg-purple-600",
            lightColor: "bg-purple-50 text-purple-600 border-purple-200",
            link: "/dashboard",
        },
        {
            icon: <Brain className="w-8 h-8" />,
            title: "AI-Powered Analysis",
            description: "Get intelligent stock predictions, buy/sell signals, and price targets powered by machine learning models trained on NEPSE data.",
            features: ["Daily buy/sell signals", "AI confidence scoring", "Price target prediction", "Risk assessment (Stop Loss)"],
            color: "bg-amber-600",
            lightColor: "bg-amber-50 text-amber-600 border-amber-200",
            link: "/dashboard",
        },
        {
            icon: <Bell className="w-8 h-8" />,
            title: "Watchlist & Alerts",
            description: "Create custom watchlists for your favorite stocks. Set price alerts and targets to stay informed about market movements.",
            features: ["Custom stock watchlists", "Target price alerts", "Stop loss tracking", "Real-time price updates"],
            color: "bg-rose-600",
            lightColor: "bg-rose-50 text-rose-600 border-rose-200",
            link: "/dashboard",
        },
        {
            icon: <LineChart className="w-8 h-8" />,
            title: "Advanced Charts",
            description: "Professional-grade interactive trading charts with candlestick patterns, technical indicators, and historical data analysis.",
            features: ["Candlestick charts", "TradingView-style interface", "Historical price data", "Multi-timeframe analysis"],
            color: "bg-cyan-600",
            lightColor: "bg-cyan-50 text-cyan-600 border-cyan-200",
            link: "/dashboard",
        },
    ];

    return (
        <PublicLayout>
            <div className="container mx-auto max-w-7xl px-4 lg:px-20 py-6">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-mero-teal/10 text-mero-teal px-4 py-1.5 rounded-full text-sm font-bold mb-4 border border-mero-teal/20">
                        <Zap className="w-4 h-4" /> Powered by NEPSE Real-Time Data
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-800 mb-4">
                        Everything You Need for<br />
                        <span className="text-mero-teal">Smart Investing</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        ShareSathi provides a comprehensive suite of tools for Nepal stock market investors — from real-time market data to AI-powered predictions.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {services.map((service, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group">
                            <div className={`${service.color} text-white p-6`}>
                                <div className="flex items-center gap-3 mb-3">
                                    {service.icon}
                                    <h3 className="text-lg font-bold">{service.title}</h3>
                                </div>
                                <p className="text-sm text-white/80">{service.description}</p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-2 mb-4">
                                    {service.features.map((feature, fi) => (
                                        <li key={fi} className="flex items-center gap-2 text-sm text-slate-600">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to={service.link}
                                    className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg border transition-colors ${service.lightColor} hover:opacity-80`}
                                >
                                    Explore <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Live Market Preview */}
                {summary && (
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-12">
                        <div className="bg-gradient-to-r from-mero-teal to-mero-darkTeal text-white p-6">
                            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                                <Activity className="w-5 h-5" /> Live Market Preview
                            </h3>
                            <p className="text-sm text-white/70">Real-time data powering our services</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-4 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 font-medium mb-1">NEPSE Index</p>
                                    <p className="text-2xl font-bold font-mono text-slate-800">{Number(summary.nepse_index).toFixed(2)}</p>
                                </div>
                                <div className="text-center p-4 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 font-medium mb-1">Total Turnover</p>
                                    <p className="text-2xl font-bold font-mono text-blue-600">Rs. {(Number(summary.total_turnover) / 10000000).toFixed(2)} Cr</p>
                                </div>
                                <div className="text-center p-4 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 font-medium mb-1">Top Gainers</p>
                                    <p className="text-2xl font-bold text-emerald-600">{topGainers.length}</p>
                                </div>
                                <div className="text-center p-4 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 font-medium mb-1">Market Status</p>
                                    <p className={`text-2xl font-bold ${summary.market_status === 'Open' ? 'text-emerald-600' : 'text-slate-600'}`}>
                                        {summary.market_status}
                                    </p>
                                </div>
                            </div>
                            <div className="text-center">
                                <button
                                    onClick={() => navigate('/market')}
                                    className="bg-mero-teal hover:bg-mero-darkTeal text-white font-bold px-8 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
                                >
                                    Explore Full Market Data <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-mero-teal to-mero-darkTeal rounded-xl p-8 md:p-12 text-white text-center">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-80" />
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">Start Paper Trading Today</h2>
                    <p className="text-white/80 max-w-xl mx-auto mb-6">
                        Create a free account and get Rs. 10,00,000 in virtual money to practice trading on NEPSE stocks with real market data.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate('/login', { state: { register: true } })}
                            className="bg-mero-orange hover:bg-mero-darkOrange text-white font-bold px-8 py-3 rounded-lg transition-colors inline-flex items-center gap-2 justify-center"
                        >
                            Create Free Account <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-lg transition-colors border border-white/30"
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ServicesPage;
