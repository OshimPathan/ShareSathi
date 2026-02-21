import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import insforge from '../../lib/insforge';
import { useAuthStore } from '../../store/authStore';

interface AdminStats {
  totalUsers: number;
  totalTrades: number;
  totalWatchlists: number;
  subscriptions: { free: number; basic: number; pro: number };
  recentTrades: Array<{
    id: string;
    user_id: string;
    symbol: string;
    trade_type: string;
    quantity: number;
    price: number;
    created_at: string;
  }>;
}

const ADMIN_EMAILS = ['oseempathan@gmail.com']; // Add your admin emails

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      navigate('/dashboard');
      return;
    }
    fetchStats();
  }, [user, navigate]);

  async function fetchStats() {
    try {
      setLoading(true);

      const [usersRes, tradesRes, watchlistRes, subsRes, recentTradesRes] = await Promise.all([
        insforge.database.from('users').select('id', { count: 'exact', head: true }),
        insforge.database.from('transactions').select('id', { count: 'exact', head: true }),
        insforge.database.from('watchlists').select('id', { count: 'exact', head: true }),
        insforge.database.from('subscriptions').select('tier'),
        insforge.database
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      const subCounts = { free: 0, basic: 0, pro: 0 };
      if (subsRes.data) {
        for (const s of subsRes.data) {
          const t = s.tier as keyof typeof subCounts;
          if (t in subCounts) subCounts[t]++;
        }
      }

      setStats({
        totalUsers: usersRes.count ?? 0,
        totalTrades: tradesRes.count ?? 0,
        totalWatchlists: watchlistRes.count ?? 0,
        subscriptions: subCounts,
        recentTrades: recentTradesRes.data ?? [],
      });
    } catch (e) {
      setError('Failed to load admin stats');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Back to App
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-400"></div>
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Users" value={stats.totalUsers} color="teal" />
              <StatCard label="Total Trades" value={stats.totalTrades} color="blue" />
              <StatCard label="Watchlist Items" value={stats.totalWatchlists} color="purple" />
              <StatCard
                label="Active Subscriptions"
                value={stats.subscriptions.basic + stats.subscriptions.pro}
                color="amber"
              />
            </div>

            {/* Subscription Breakdown */}
            <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Subscription Breakdown</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-300">{stats.subscriptions.free}</p>
                  <p className="text-sm text-gray-500">Free</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-teal-400">{stats.subscriptions.basic}</p>
                  <p className="text-sm text-gray-500">Basic (Rs.199/mo)</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-400">{stats.subscriptions.pro}</p>
                  <p className="text-sm text-gray-500">Pro (Rs.499/mo)</p>
                </div>
              </div>
            </div>

            {/* Revenue Estimate */}
            <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800">
              <h2 className="text-lg font-semibold mb-2">Monthly Revenue Estimate</h2>
              <p className="text-4xl font-bold text-green-400">
                Rs.{' '}
                {(stats.subscriptions.basic * 199 + stats.subscriptions.pro * 499).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Based on active paid subscriptions</p>
            </div>

            {/* Recent Trades */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Recent Trades (Last 20)</h2>
              {stats.recentTrades.length === 0 ? (
                <p className="text-gray-500">No trades yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-800">
                        <th className="text-left py-2 px-3">Symbol</th>
                        <th className="text-left py-2 px-3">Type</th>
                        <th className="text-right py-2 px-3">Qty</th>
                        <th className="text-right py-2 px-3">Price</th>
                        <th className="text-right py-2 px-3">Total</th>
                        <th className="text-right py-2 px-3">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentTrades.map((t) => (
                        <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-2 px-3 font-medium">{t.symbol}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                t.trade_type === 'BUY'
                                  ? 'bg-green-900/40 text-green-400'
                                  : 'bg-red-900/40 text-red-400'
                              }`}
                            >
                              {t.trade_type}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">{t.quantity}</td>
                          <td className="py-2 px-3 text-right">Rs.{t.price?.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right">
                            Rs.{(t.quantity * t.price).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-500">
                            {new Date(t.created_at).toLocaleString('en-NP', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'teal' | 'blue' | 'purple' | 'amber';
}) {
  const colors = {
    teal: 'border-teal-600 text-teal-400',
    blue: 'border-blue-600 text-blue-400',
    purple: 'border-purple-600 text-purple-400',
    amber: 'border-amber-600 text-amber-400',
  };

  return (
    <div className={`bg-gray-900 rounded-xl p-5 border ${colors[color]}`}>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colors[color].split(' ')[1]}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
