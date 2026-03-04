// ─── Watchlist (authenticated) ─────────────────────────────
import insforge from '../../lib/insforge';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import type { WatchlistItem } from '../../types';

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return [];
  const userId = session.session.user.id;

  const { data, error } = await insforge.database
    .from('watchlist')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];

  // Enrich with current stock data
  const items = data as WatchlistItem[];
  if (items.length === 0) return [];

  const symbols = items.map(i => i.symbol);
  const { data: stocks } = await insforge.database
    .from('stocks')
    .select('symbol, ltp, company_name, sector, percentage_change')
    .in('symbol', symbols);

  const stockMap: Record<string, any> = {};
  (stocks || []).forEach((s: any) => { stockMap[s.symbol] = s; });

  return items.map(item => ({
    ...item,
    current_price: Number(stockMap[item.symbol]?.ltp) || 0,
    company_name: stockMap[item.symbol]?.company_name || item.symbol,
    sector: stockMap[item.symbol]?.sector || null,
    percentage_change: Number(stockMap[item.symbol]?.percentage_change) || 0,
  }));
}

export async function addToWatchlist(symbol: string): Promise<{ success: boolean; message: string }> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return { success: false, message: 'Not authenticated' };
  const userId = session.session.user.id;

  // ── Premium gate: check watchlist limit ──
  const sub = useSubscriptionStore.getState();
  const maxWatchlist = sub.getLimit('maxWatchlist');
  if (maxWatchlist !== -1) {
    const { data: countData } = await insforge.database
      .from('watchlist')
      .select('id')
      .eq('user_id', userId);
    const currentCount = (countData as unknown[] | null)?.length ?? 0;
    if (currentCount >= maxWatchlist) {
      return { success: false, message: `Watchlist limit reached (${maxWatchlist}). Upgrade your plan for more.` };
    }
  }

  const { error } = await insforge.database
    .from('watchlist')
    .insert({ user_id: userId, symbol: symbol.toUpperCase() });
  if (error) {
    if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
      return { success: false, message: 'Already in watchlist' };
    }
    return { success: false, message: error.message || 'Failed to add' };
  }
  return { success: true, message: 'Added to watchlist' };
}

export async function removeFromWatchlist(symbol: string): Promise<boolean> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return false;
  const userId = session.session.user.id;

  const { error } = await insforge.database
    .from('watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('symbol', symbol.toUpperCase());
  return !error;
}

export async function updateWatchlistAlerts(
  symbol: string,
  targetPrice: number | null,
  stopLoss: number | null
): Promise<boolean> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return false;
  const userId = session.session.user.id;

  const { error } = await insforge.database
    .from('watchlist')
    .update({ target_price: targetPrice, stop_loss: stopLoss })
    .eq('user_id', userId)
    .eq('symbol', symbol.toUpperCase());
  return !error;
}
