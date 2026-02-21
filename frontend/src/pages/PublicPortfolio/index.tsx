import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Briefcase, TrendingUp, TrendingDown, ArrowLeft, BarChart3, Activity, Copy, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import PublicLayout from "../../components/layout/PublicLayout";
import { getPublicPortfolio, type PublicPortfolioData } from "../../services/db";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#238b96", "#eda34c", "#6366f1", "#ec4899", "#22c55e", "#f97316", "#8b5cf6", "#14b8a6", "#ef4444", "#3b82f6"];

const PublicPortfolioPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<PublicPortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const result = await getPublicPortfolio(userId);
      setData(result);
      setLoading(false);
    })();
  }, [userId]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sector allocation for pie chart
  const sectorAlloc = data
    ? Object.entries(
        data.assets.reduce<Record<string, number>>((acc, a) => {
          const sec = a.sector || "Unknown";
          acc[sec] = (acc[sec] || 0) + a.current_value;
          return acc;
        }, {})
      )
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    : [];

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        </div>
      </PublicLayout>
    );
  }

  if (!data) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Portfolio Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            This trader hasn't added any holdings yet, or the link is invalid.
          </p>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-mero-teal text-white text-sm font-medium hover:bg-mero-darkTeal transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const { assets, summary, user_name, total_trades } = data;

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mero-teal to-mero-darkTeal flex items-center justify-center text-white text-lg font-extrabold">
              {user_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
                {user_name}'s Portfolio
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {assets.length} holdings · {total_trades} trades
              </p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Share"}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" } as React.CSSProperties}>
          {[
            { label: "Investment", value: `Rs. ${summary.total_investment.toLocaleString("en-NP", { maximumFractionDigits: 0 })}`, icon: Briefcase, color: "blue" },
            { label: "Current Value", value: `Rs. ${summary.total_current_value.toLocaleString("en-NP", { maximumFractionDigits: 0 })}`, icon: BarChart3, color: "indigo" },
            {
              label: "Total P/L",
              value: `${summary.total_pnl >= 0 ? "+" : ""}Rs. ${Math.abs(summary.total_pnl).toLocaleString("en-NP", { maximumFractionDigits: 0 })}`,
              icon: summary.total_pnl >= 0 ? TrendingUp : TrendingDown,
              color: summary.total_pnl >= 0 ? "emerald" : "rose",
            },
            {
              label: "Return",
              value: `${summary.overall_pnl_percentage >= 0 ? "+" : ""}${summary.overall_pnl_percentage.toFixed(2)}%`,
              icon: Activity,
              color: summary.overall_pnl_percentage >= 0 ? "emerald" : "rose",
            },
          ].map((card, i) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <card.icon className={`w-4 h-4 text-${card.color}-500`} />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</span>
                </div>
                <p className={`text-lg font-extrabold font-mono ${
                  card.color === "emerald" ? "text-emerald-600" : card.color === "rose" ? "text-rose-600" : "text-slate-900 dark:text-white"
                }`}>
                  {card.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sector Allocation */}
        {sectorAlloc.length > 0 && (
          <Card className="animate-slide-up" style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" } as React.CSSProperties}>
            <CardHeader>
              <CardTitle>Sector Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sectorAlloc} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                        {sectorAlloc.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `Rs. ${Number(value).toLocaleString("en-NP", { maximumFractionDigits: 0 })}`}
                        contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sectorAlloc.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-slate-600 dark:text-slate-400">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Holdings Table */}
        <Card className="animate-slide-up" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" } as React.CSSProperties}>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Symbol</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">Qty</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">Avg. Cost</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">LTP</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">P/L</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">Return</th>
                </tr>
              </thead>
              <tbody>
                {assets
                  .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
                  .map((a) => (
                    <tr key={a.symbol} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/stock/${a.symbol}`} className="font-bold text-mero-teal hover:underline">
                          {a.symbol}
                        </Link>
                        <p className="text-xs text-slate-400 truncate max-w-[150px]">{a.company_name}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">{a.quantity}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {a.average_buy_price.toLocaleString("en-NP", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {a.current_price.toLocaleString("en-NP", { maximumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${a.pnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {a.pnl >= 0 ? "+" : ""}Rs. {Math.abs(a.pnl).toLocaleString("en-NP", { maximumFractionDigits: 0 })}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${a.pnl_percentage >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {a.pnl_percentage >= 0 ? "+" : ""}{a.pnl_percentage.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Back link */}
        <div className="text-center pt-4">
          <Link to="/leaderboard" className="text-sm font-medium text-mero-teal hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PublicPortfolioPage;
