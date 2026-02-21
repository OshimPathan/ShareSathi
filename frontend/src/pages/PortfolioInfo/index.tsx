import { useNavigate } from 'react-router-dom';
import { PieChart, Wallet, TrendingUp, BarChart3, ArrowRight, Shield, Target, History } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';

export const PortfolioInfoPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <PieChart className="w-6 h-6" />,
            title: "Sector Allocation",
            description: "Visualize your portfolio distribution across different sectors with interactive pie charts.",
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: "Real-Time Valuation",
            description: "Track your portfolio's current market value with real-time NEPSE prices.",
        },
        {
            icon: <Wallet className="w-6 h-6" />,
            title: "Profit & Loss Tracking",
            description: "Monitor gains and losses on each holding with detailed P&L analysis.",
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Performance Metrics",
            description: "Analyze your investment performance with comprehensive metrics and benchmarks.",
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: "Target Price Alerts",
            description: "Set price targets on your holdings and get notified when they're reached.",
        },
        {
            icon: <History className="w-6 h-6" />,
            title: "Transaction History",
            description: "Complete record of all your buy and sell transactions with timestamps.",
        },
    ];

    return (
        <PublicLayout>
            <div className="container mx-auto max-w-7xl px-4 lg:px-20 py-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-800 mb-4">
                        Portfolio Management
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Track, analyze, and manage your NEPSE stock investments with our powerful portfolio tools. Start paper trading with Rs. 10,00,000 virtual cash.
                    </p>
                </div>

                {/* Portfolio Preview */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-10">
                    <div className="bg-gradient-to-r from-mero-teal to-mero-darkTeal p-8 text-white">
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <p className="text-sm text-white/70 mb-1">Starting Capital</p>
                                <p className="text-3xl font-bold font-mono">Rs. 10,00,000</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-white/70 mb-1">Paper Trading</p>
                                <p className="text-3xl font-bold">Risk Free</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-white/70 mb-1">Real Prices</p>
                                <p className="text-3xl font-bold">Live NEPSE</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-white/70 mb-1">AI Insights</p>
                                <p className="text-3xl font-bold">Included</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {features.map((feature, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-mero-teal/10 rounded-lg flex items-center justify-center text-mero-teal mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                    <Shield className="w-10 h-10 text-mero-teal mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Ready to Build Your Portfolio?</h2>
                    <p className="text-slate-500 mb-6 max-w-lg mx-auto">
                        Sign up for free and start practicing with virtual money. Learn to invest before putting real money at risk.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => navigate('/login', { state: { register: true } })}
                            className="bg-mero-teal hover:bg-mero-darkTeal text-white font-bold px-8 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                            Get Started Free <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-white text-mero-teal font-bold px-8 py-3 rounded-lg transition-colors border border-mero-teal hover:bg-mero-teal/5"
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default PortfolioInfoPage;
