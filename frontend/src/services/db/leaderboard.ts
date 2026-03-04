// ─── Leaderboard (public) ──────────────────────────────────
import insforge from '../../lib/insforge';
import type { PortfolioItem } from '../../types';

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  total_investment: number;
  total_current_value: number;
  total_pnl: number;
  pnl_percentage: number;
  holdings_count: number;
  total_trades: number;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  // 1. Get all portfolio rows (public data — no sensitive info)
  const { data: allHoldings, error: hErr } = await insforge.database
    .from('portfolio')
    .select('user_id, symbol, quantity, average_buy_price');
  if (hErr || !allHoldings || allHoldings.length === 0) return [];

  // Filter out zombie rows with zero quantity
  const activeLeaderboardHoldings = (allHoldings as PortfolioItem[]).filter(h => h.quantity > 0);
  if (activeLeaderboardHoldings.length === 0) return [];

  // 2. Get current stock prices
  const symbols = [...new Set(activeLeaderboardHoldings.map(h => h.symbol))];
  const { data: stocks } = await insforge.database
    .from('stocks')
    .select('symbol, ltp')
    .in('symbol', symbols);
  const priceMap: Record<string, number> = {};
  (stocks || []).forEach((s: any) => { priceMap[s.symbol] = Number(s.ltp); });

  // 3. Get user names
  const userIds = [...new Set(activeLeaderboardHoldings.map(h => h.user_id))];
  let nameMap: Record<string, string> = {};
  try {
    const { data: profiles } = await insforge.database
      .from('profiles')
      .select('id, name')
      .in('id', userIds);
    (profiles || []).forEach((p: any) => { nameMap[p.id] = p.name || 'Anonymous'; });
  } catch {
    // profiles table doesn't exist, use fallback
  }

  // 4. Get trade counts per user
  const { data: trades } = await insforge.database
    .from('transactions')
    .select('user_id');
  const tradeCountMap: Record<string, number> = {};
  (trades || []).forEach((t: any) => {
    tradeCountMap[t.user_id] = (tradeCountMap[t.user_id] || 0) + 1;
  });

  // 5. Aggregate per user
  const userMap: Record<string, { investment: number; currentValue: number; holdings: number }> = {};
  activeLeaderboardHoldings.forEach(h => {
    if (!userMap[h.user_id]) userMap[h.user_id] = { investment: 0, currentValue: 0, holdings: 0 };
    const inv = h.quantity * h.average_buy_price;
    const cur = h.quantity * (priceMap[h.symbol] || 0);
    userMap[h.user_id].investment += inv;
    userMap[h.user_id].currentValue += cur;
    userMap[h.user_id].holdings += 1;
  });

  const entries: LeaderboardEntry[] = Object.entries(userMap).map(([uid, v]) => ({
    user_id: uid,
    user_name: nameMap[uid] || `Trader-${uid.slice(0, 6)}`,
    total_investment: v.investment,
    total_current_value: v.currentValue,
    total_pnl: v.currentValue - v.investment,
    pnl_percentage: v.investment > 0 ? ((v.currentValue - v.investment) / v.investment) * 100 : 0,
    holdings_count: v.holdings,
    total_trades: tradeCountMap[uid] || 0,
  }));

  // Sort by P/L percentage desc
  entries.sort((a, b) => b.pnl_percentage - a.pnl_percentage);
  return entries;
}
