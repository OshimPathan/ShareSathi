import { useState, useEffect } from "react";
import { Trophy, TrendingUp, Users, BarChart3, Crown, Share2, Copy, Check } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import PublicLayout from "../../components/layout/PublicLayout";
import { getLeaderboard, type LeaderboardEntry } from "../../services/db";
import { useAuthStore } from "../../store/authStore";

const RANK_STYLES = [
  { bg: "bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-slate-800", badge: "bg-gradient-to-br from-amber-400 to-yellow-500", text: "text-amber-700 dark:text-amber-400" },
  { bg: "bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-700/30 dark:to-slate-800", badge: "bg-gradient-to-br from-slate-400 to-slate-500", text: "text-slate-600 dark:text-slate-300" },
  { bg: "bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-slate-800", badge: "bg-gradient-to-br from-orange-400 to-orange-600", text: "text-orange-700 dark:text-orange-400" },
];

const LeaderboardPage = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"all" | "monthly">("all");
  const [sortBy, setSortBy] = useState<"pnl_percentage" | "total_pnl" | "total_trades">("pnl_percentage");
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getLeaderboard();
      setEntries(data);
      setLoading(false);
    })();
  }, []);

  const sorted = [...entries].sort((a, b) => {
    if (sortBy === "pnl_percentage") return b.pnl_percentage - a.pnl_percentage;
    if (sortBy === "total_pnl") return b.total_pnl - a.total_pnl;
    return b.total_trades - a.total_trades;
  });

  const myRank = user ? sorted.findIndex((e) => e.user_id === user.id) + 1 : 0;
  const myEntry = user ? sorted.find((e) => e.user_id === user.id) : null;

  const topThree = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Leaderboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Top paper traders on ShareSathi
              </p>
            </div>
          </div>
        </div>

        {/* Your Rank Card */}
        {myEntry && (
          <Card className="border-mero-teal/30 animate-slide-up delay-100" style={{ opacity: 0, animationFillMode: "forwards" } as React.CSSProperties}>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-mero-teal/10 flex items-center justify-center">
                    <span className="text-lg font-extrabold text-mero-teal">#{myRank}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Your Ranking</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {myEntry.holdings_count} holdings · {myEntry.total_trades} trades
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-extrabold font-mono ${myEntry.total_pnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {myEntry.total_pnl >= 0 ? "+" : ""}{myEntry.pnl_percentage.toFixed(2)}%
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Rs. {myEntry.total_pnl.toLocaleString("en-NP", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap animate-slide-up delay-200" style={{ opacity: 0, animationFillMode: "forwards" } as React.CSSProperties}>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">Sort by:</span>
          {[
            { key: "pnl_percentage" as const, label: "Return %", icon: <TrendingUp className="w-3 h-3" /> },
            { key: "total_pnl" as const, label: "Total P/L", icon: <BarChart3 className="w-3 h-3" /> },
            { key: "total_trades" as const, label: "Most Active", icon: <Users className="w-3 h-3" /> },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === opt.key
                  ? "bg-mero-teal text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
          <div className="ml-auto flex gap-1">
            {(["all", "monthly"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  timeframe === t
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {t === "all" ? "All Time" : "This Month"}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Podium */}
        {!loading && topThree.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 animate-slide-up delay-300" style={{ opacity: 0, animationFillMode: "forwards" } as React.CSSProperties}>
            {[1, 0, 2].map((podiumIdx) => {
              const entry = topThree[podiumIdx];
              const rank = podiumIdx + 1;
              const style = RANK_STYLES[podiumIdx];
              const isCenter = podiumIdx === 0;
              return (
                <div
                  key={entry.user_id}
                  className={`relative rounded-2xl border p-5 text-center transition-all ${style.bg} ${
                    isCenter ? "border-amber-200/80 dark:border-amber-700/50 -mt-4 shadow-lg" : "border-slate-200/80 dark:border-slate-700/60"
                  }`}
                >
                  {isCenter && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Crown className="w-6 h-6 text-amber-500" />
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-full ${style.badge} flex items-center justify-center text-white text-sm font-extrabold mx-auto mb-3`}>
                    {rank}
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {entry.user_name}
                  </p>
                  <div className={`text-xl font-extrabold font-mono mt-1 ${entry.total_pnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {entry.total_pnl >= 0 ? "+" : ""}{entry.pnl_percentage.toFixed(2)}%
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {entry.total_trades} trades
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Rest of Leaderboard */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Rank</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400">Trader</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">Return %</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">P/L (Rs.)</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400 hidden md:table-cell">Holdings</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400 hidden md:table-cell">Trades</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-700/50">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : rest.length === 0 && topThree.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No traders on the leaderboard yet</p>
                      <p className="text-xs text-slate-400 mt-1">Start trading to appear here!</p>
                    </td>
                  </tr>
                ) : (
                  rest.map((entry, i) => {
                    const rank = i + 4;
                    const isMe = user && entry.user_id === user.id;
                    return (
                      <tr
                        key={entry.user_id}
                        className={`border-b border-slate-100 dark:border-slate-700/50 transition-colors ${
                          isMe ? "bg-mero-teal/5" : "hover:bg-slate-50 dark:hover:bg-slate-700/30"
                        }`}
                      >
                        <td className="px-4 py-3 font-mono font-bold text-slate-400">{rank}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mero-teal to-mero-darkTeal flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {entry.user_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                              {entry.user_name}
                              {isMe && <span className="ml-1 text-[10px] text-mero-teal font-bold">(You)</span>}
                            </span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-right font-mono font-bold ${
                          entry.total_pnl >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {entry.total_pnl >= 0 ? "+" : ""}{entry.pnl_percentage.toFixed(2)}%
                        </td>
                        <td className={`px-4 py-3 text-right font-mono ${
                          entry.total_pnl >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {entry.total_pnl >= 0 ? "+" : ""}Rs. {Math.abs(entry.total_pnl).toLocaleString("en-NP", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400 hidden md:table-cell">
                          {entry.holdings_count}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400 hidden md:table-cell">
                          {entry.total_trades}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Share Portfolio CTA */}
        <SharePortfolioCTA />
      </div>
    </PublicLayout>
  );
};

/* ── Share Portfolio Card ── */
function SharePortfolioCTA() {
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const shareUrl = `${window.location.origin}/portfolio/public/${user.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Share Your Portfolio</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Let others see your paper trading performance</p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              copied
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default LeaderboardPage;
