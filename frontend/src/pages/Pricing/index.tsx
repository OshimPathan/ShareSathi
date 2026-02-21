import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PLAN_PRICING, PLAN_FEATURES, type PlanTier } from '../../store/subscriptionStore';
import { useAuthStore } from '../../store/authStore';

const FEATURE_LIST = [
    { key: 'maxWatchlist', label: 'Watchlist Stocks', format: (v: number) => v === -1 ? 'Unlimited' : `${v}` },
    { key: 'maxDailyTrades', label: 'Daily Trades', format: (v: number) => v === -1 ? 'Unlimited' : `${v}` },
    { key: 'advancedCharts', label: 'Advanced Charts', format: (v: boolean) => v ? '✓' : '—' },
    { key: 'aiInsights', label: 'AI Insights (when available)', format: (v: boolean) => v ? '✓' : '—' },
    { key: 'exportData', label: 'Export Portfolio Data', format: (v: boolean) => v ? '✓' : '—' },
    { key: 'prioritySupport', label: 'Priority Support', format: (v: boolean) => v ? '✓' : '—' },
] as const;

const TIERS: PlanTier[] = ['free', 'basic', 'pro'];

export const Pricing = () => {
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    return (
        <PublicLayout showTicker={false}>
            <div className="py-16 px-4 md:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-slate-800 mb-3">Choose Your Plan</h1>
                        <p className="text-slate-500 max-w-xl mx-auto">
                            Start free and upgrade when you need more features. All plans include real NEPSE data and paper trading.
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button
                                onClick={() => setBilling('monthly')}
                                className={`px-4 py-2 text-sm rounded-lg transition-colors ${billing === 'monthly' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBilling('yearly')}
                                className={`px-4 py-2 text-sm rounded-lg transition-colors ${billing === 'yearly' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Yearly <span className="text-emerald-500 text-xs ml-1">Save 16%</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TIERS.map((tier) => {
                            const pricing = PLAN_PRICING[tier];
                            const features = PLAN_FEATURES[tier];
                            const price = billing === 'monthly' ? pricing.monthly : pricing.yearly;
                            const isPopular = tier === 'basic';

                            return (
                                <Card
                                    key={tier}
                                    className={`relative ${isPopular ? 'border-2 border-blue-500 shadow-lg' : 'border-slate-200'}`}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            MOST POPULAR
                                        </div>
                                    )}
                                    <CardHeader className="text-center pb-4">
                                        <CardTitle className="text-lg">{pricing.label}</CardTitle>
                                        <div className="mt-3">
                                            {price === 0 ? (
                                                <span className="text-4xl font-bold text-slate-800">Free</span>
                                            ) : (
                                                <>
                                                    <span className="text-4xl font-bold text-slate-800">Rs. {price.toLocaleString()}</span>
                                                    <span className="text-slate-500 text-sm ml-1">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                                                </>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3 mb-6">
                                            {FEATURE_LIST.map((feat) => {
                                                const val = features[feat.key as keyof typeof features];
                                                const formatted = (feat.format as (v: never) => string)(val as never);
                                                const isIncluded = formatted !== '—';
                                                return (
                                                    <li key={feat.key} className={`flex items-center gap-2 text-sm ${isIncluded ? 'text-slate-700' : 'text-slate-400'}`}>
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${isIncluded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                            {isIncluded ? '✓' : '—'}
                                                        </span>
                                                        <span>{feat.label}: <strong>{formatted}</strong></span>
                                                    </li>
                                                );
                                            })}
                                        </ul>

                                        {tier === 'free' ? (
                                            isAuthenticated ? (
                                                <Button className="w-full py-3 bg-slate-100 text-slate-600 hover:bg-slate-200" disabled>
                                                    Current Plan
                                                </Button>
                                            ) : (
                                                <Link to="/login">
                                                    <Button className="w-full py-3 bg-slate-800 text-white hover:bg-slate-700">
                                                        Get Started Free
                                                    </Button>
                                                </Link>
                                            )
                                        ) : (
                                            <Button
                                                className={`w-full py-3 ${isPopular ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                                                onClick={() => alert(`Payment integration coming soon! ${pricing.label} plan — Rs. ${price}/${billing === 'monthly' ? 'month' : 'year'}`)}
                                            >
                                                Upgrade to {pricing.label}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="mt-12 text-center text-sm text-slate-500">
                        <p>
                            Payment integration (Khalti / eSewa) coming soon.{' '}
                            <Link to="/contact" className="text-blue-600 hover:underline">Contact us</Link> for early access or enterprise plans.
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Pricing;
