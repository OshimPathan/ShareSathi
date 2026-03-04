import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Zap,
  BookOpen,
  Target,
  BarChart3,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import PublicLayout from '../../components/layout/PublicLayout';
import SEO from '../../components/ui/SEO';
import { useAuthStore } from '../../store/authStore';
import { useCreditStore } from '../../store/creditStore';
import { initiateKhaltiPayment } from '../../services/payment';
import type { CreditPackage } from '../../types';

const BuyCreditsPage = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { credits, packages, isLoading, initialize, purchaseCredits } = useCreditStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handlePurchase = async (pkg: CreditPackage) => {
    if (!isAuthenticated) return;
    setPurchasing(pkg.id);
    setSuccessMsg('');

    // Initiate payment (currently stub)
    const paymentResult = await initiateKhaltiPayment({
      amount: pkg.price_npr * 100, // paisa
      productName: `ShareSathi Practice Credits — ${pkg.name}`,
      productIdentity: `credits_${pkg.id}`,
    });

    if (paymentResult.success) {
      const result = await purchaseCredits(pkg.id, paymentResult.token);
      if (result.success) {
        setSuccessMsg(result.message);
      }
    } else {
      // In stub mode, simulate purchase for demo
      if (paymentResult.error?.includes('not yet live')) {
        const result = await purchaseCredits(pkg.id, 'demo_payment');
        if (result.success) {
          setSuccessMsg(result.message);
        }
      }
    }

    setPurchasing(null);
  };

  const HOW_IT_WORKS = [
    {
      icon: <Coins className="w-6 h-6 text-amber-500" />,
      title: 'Buy Credits',
      desc: 'Purchase practice credits starting from just Rs 25.',
    },
    {
      icon: <Target className="w-6 h-6 text-mero-teal" />,
      title: 'Trade Like Real',
      desc: 'Each trade costs 1 credit. Use real NEPSE prices with actual brokerage fees.',
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-blue-500" />,
      title: 'Learn & Improve',
      desc: 'Track your practice portfolio, analyse P/L, and build confidence.',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
      title: 'Go Live',
      desc: 'When ready, trade real stocks through your DMAT & broker account.',
    },
  ];

  const WHY_PRACTICE = [
    { icon: <ShieldCheck className="w-5 h-5" />, text: 'Zero risk — learn with virtual money' },
    { icon: <BarChart3 className="w-5 h-5" />, text: 'Real NEPSE prices & brokerage fees' },
    { icon: <BookOpen className="w-5 h-5" />, text: 'Understand secondary market mechanics' },
    { icon: <Zap className="w-5 h-5" />, text: 'Build confidence before investing real money' },
  ];

  return (
    <PublicLayout>
      <SEO
        title="Buy Practice Credits — Learn to Trade"
        description="Purchase practice credits and learn secondary market trading with real NEPSE data. Start from Rs 25 and trade risk-free."
        canonical="/buy-credits"
      />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* Hero */}
        <div className="text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4 border border-amber-200">
            <Sparkles className="w-4 h-4" /> Learn to Trade — Practice Mode
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Master Stock Trading<br />
            <span className="text-mero-teal">Before Investing Real Money</span>
          </h1>
          <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
            Buy practice credits and trade NEPSE stocks with real prices. Each trade costs just 1 credit.
            Learn how secondary market trading works — risk-free.
          </p>

          {/* Credit Balance Badge */}
          {isAuthenticated && credits && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-5 py-2.5 shadow-sm">
              <Coins className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Your Balance:</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">{credits.balance}</span>
              <span className="text-sm text-slate-500">credits</span>
              {credits.balance > 0 && (
                <Link
                  to="/practice"
                  className="ml-2 text-xs font-bold text-mero-teal hover:underline flex items-center gap-1"
                >
                  Start Trading <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="max-w-md mx-auto bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 flex items-center gap-3 animate-slide-up">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">{successMsg}</p>
              <Link to="/practice" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-1">
                Start Practice Trading <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 text-center">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center mb-3">
                  {step.icon}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">{step.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Packages */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 text-center">Choose Your Package</h2>
          {isLoading && packages.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-60 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative overflow-hidden transition-transform hover:-translate-y-1 ${
                    pkg.is_popular ? 'border-2 border-mero-teal shadow-lg ring-1 ring-mero-teal/20' : ''
                  }`}
                >
                  {pkg.is_popular && (
                    <div className="absolute top-0 right-0 bg-mero-teal text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                      BEST VALUE
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{pkg.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white">Rs {pkg.price_npr}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold text-mero-teal">{pkg.credits}</span>
                      <span className="text-sm text-slate-500">credits</span>
                      {pkg.bonus_credits > 0 && (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full ml-1">
                          +{pkg.bonus_credits} bonus
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-500 mb-4">{pkg.description}</p>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-4">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        {pkg.credits + pkg.bonus_credits} total trades
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        Rs {(pkg.price_npr / (pkg.credits + pkg.bonus_credits)).toFixed(2)}/trade
                      </li>
                    </ul>
                    {isAuthenticated ? (
                      <Button
                        className={`w-full ${pkg.is_popular ? 'bg-mero-teal text-white hover:bg-mero-darkTeal' : ''}`}
                        variant={pkg.is_popular ? 'primary' : 'secondary'}
                        disabled={purchasing === pkg.id}
                        onClick={() => handlePurchase(pkg)}
                      >
                        {purchasing === pkg.id ? 'Processing...' : `Buy ${pkg.credits + pkg.bonus_credits} Credits`}
                      </Button>
                    ) : (
                      <Link to="/login">
                        <Button className="w-full" variant="secondary">
                          Login to Purchase
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <p className="text-center text-xs text-slate-400 mt-3">
            Payment via Khalti / eSewa — coming soon. Currently in demo mode.
          </p>
        </div>

        {/* Why Practice Trading */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
            Why Practice Before Real Trading?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WHY_PRACTICE.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-mero-teal/10 flex items-center justify-center text-mero-teal shrink-0">
                  {item.icon}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 justify-center">
            {isAuthenticated ? (
              credits && credits.balance > 0 ? (
                <Link to="/practice">
                  <Button size="lg" className="gap-2">
                    <Target className="w-4 h-4" /> Start Practice Trading
                  </Button>
                </Link>
              ) : (
                <p className="text-sm text-slate-500">
                  Purchase credits above to start practice trading
                </p>
              )
            ) : (
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  <ArrowRight className="w-4 h-4" /> Create Free Account
                </Button>
              </Link>
            )}
            <Link to="/learn">
              <Button variant="ghost" size="lg" className="gap-2">
                <BookOpen className="w-4 h-4" /> Learn Trading Basics First
              </Button>
            </Link>
          </div>
        </div>

        {/* What You'll Learn */}
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">What You'll Learn</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xl mx-auto">
            Practice trading teaches you the exact same mechanics used in real secondary market trading on NEPSE
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
                title: 'Buying Stocks',
                desc: 'Learn to analyse prices, place buy orders, and understand brokerage & SEBON fees.',
              },
              {
                icon: <TrendingDown className="w-6 h-6 text-rose-500" />,
                title: 'Selling Stocks',
                desc: 'Know when to sell, understand profit/loss calculation, and capital gains impact.',
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
                title: 'Portfolio Management',
                desc: 'Track holdings, monitor sector allocation, and evaluate overall performance.',
              },
            ].map((item, i) => (
              <Card key={i}>
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default BuyCreditsPage;
