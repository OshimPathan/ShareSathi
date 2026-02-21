// ============================================================
// ShareSathi – InsForge Database Service Layer
// All data operations go through these functions.
// ============================================================
import insforge from '../lib/insforge';
import { useSubscriptionStore } from '../store/subscriptionStore';
import type {
  Stock,
  MarketSummary,
  SubIndex,
  HistoricalPrice,
  WalletData,
  PortfolioItem,
  PortfolioAsset,
  PortfolioSummary,
  Transaction,
  WatchlistItem,
  NewsItem,
  IpoData,
} from '../types';

// ─── Market Data (public, no auth required) ────────────────

export async function getMarketSummary(): Promise<MarketSummary | null> {
  const { data, error } = await insforge.database
    .from('market_summary')
    .select()
    .eq('id', 1)
    .single();
  if (error || !data) return null;
  return data as MarketSummary;
}

export async function getSubIndices(): Promise<SubIndex[]> {
  const { data, error } = await insforge.database
    .from('sub_indices')
    .select()
    .order('value', { ascending: false });
  if (error || !data) return [];
  return data as SubIndex[];
}

export async function getAllStocks(): Promise<Stock[]> {
  const { data, error } = await insforge.database
    .from('stocks')
    .select()
    .order('symbol', { ascending: true });
  if (error || !data) return [];
  return data as Stock[];
}

export async function getStockBySymbol(symbol: string): Promise<Stock | null> {
  const { data, error } = await insforge.database
    .from('stocks')
    .select()
    .eq('symbol', symbol.toUpperCase())
    .single();
  if (error || !data) return null;
  return data as Stock;
}

export async function searchStocks(query: string): Promise<Stock[]> {
  const { data, error } = await insforge.database
    .from('stocks')
    .select('symbol, company_name, sector')
    .ilike('symbol', `%${query}%`)
    .limit(50);

  if (error || !data) {
    // Fallback: also try company name
    const { data: data2 } = await insforge.database
      .from('stocks')
      .select('symbol, company_name, sector')
      .ilike('company_name', `%${query}%`)
      .limit(50);
    return (data2 || []) as Stock[];
  }
  return data as Stock[];
}

export async function getTopGainers(limit = 10): Promise<Stock[]> {
  const { data, error } = await insforge.database
    .from('stocks')
    .select()
    .gt('percentage_change', 0)
    .order('percentage_change', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as Stock[];
}

export async function getTopLosers(limit = 10): Promise<Stock[]> {
  const { data, error } = await insforge.database
    .from('stocks')
    .select()
    .lt('percentage_change', 0)
    .order('percentage_change', { ascending: true })
    .limit(limit);
  if (error || !data) return [];
  return data as Stock[];
}

export async function getTopTurnovers(limit = 10): Promise<Stock[]> {
  const { data, error } = await insforge.database
    .from('stocks')
    .select()
    .gt('turnover', 0)
    .order('turnover', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as Stock[];
}

export async function getStockHistory(symbol: string): Promise<HistoricalPrice[]> {
  const { data, error } = await insforge.database
    .from('historical_prices')
    .select()
    .eq('symbol', symbol.toUpperCase())
    .order('date', { ascending: true });
  if (error || !data) return [];
  return data as HistoricalPrice[];
}

export async function getStocksBySector(sector: string): Promise<Stock[]> {
  const { data, error } = await insforge.database
    .from('stocks')
    .select()
    .eq('sector', sector)
    .order('turnover', { ascending: false });
  if (error || !data) return [];
  return data as Stock[];
}

// ─── News (public) ─────────────────────────────────────────

export async function getNews(category?: string, limit = 20): Promise<NewsItem[]> {
  let query = insforge.database
    .from('news')
    .select()
    .order('published_at', { ascending: false })
    .limit(limit);

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as NewsItem[];
}

export async function getNewsCategories(): Promise<string[]> {
  const { data, error } = await insforge.database
    .from('news')
    .select('category');
  if (error || !data) return ['All'];
  const cats = [...new Set((data as { category: string }[]).map(n => n.category))].sort();
  return ['All', ...cats];
}

// ─── IPO (public) ──────────────────────────────────────────

export async function getIpos(): Promise<IpoData[]> {
  const { data, error } = await insforge.database
    .from('ipo')
    .select()
    .order('opening_date', { ascending: false });
  if (error || !data) return [];
  return data as IpoData[];
}

// ─── Wallet (authenticated) ────────────────────────────────

export async function getWallet(): Promise<WalletData | null> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return null;
  const userId = session.session.user.id;

  const { data, error } = await insforge.database
    .from('wallets')
    .select()
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    // Auto-create wallet for new users
    const { data: newWallet, error: createErr } = await insforge.database
      .from('wallets')
      .insert({ user_id: userId, balance: 100000.00 })
      .select()
      .single();
    if (createErr || !newWallet) return null;
    return newWallet as WalletData;
  }
  return data as WalletData;
}

// ─── Portfolio (authenticated) ─────────────────────────────

export async function getPortfolio(): Promise<{ assets: PortfolioAsset[]; summary: PortfolioSummary }> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return { assets: [], summary: { total_investment: 0, total_current_value: 0, total_pnl: 0, overall_pnl_percentage: 0 } };
  const userId = session.session.user.id;

  const { data: holdings, error } = await insforge.database
    .from('portfolio')
    .select()
    .eq('user_id', userId);
  if (error || !holdings || holdings.length === 0) {
    return { assets: [], summary: { total_investment: 0, total_current_value: 0, total_pnl: 0, overall_pnl_percentage: 0 } };
  }

  // Fetch current prices for all held symbols
  const symbols = (holdings as PortfolioItem[]).map(h => h.symbol);
  const { data: stocks } = await insforge.database
    .from('stocks')
    .select('symbol, ltp, sector, company_name')
    .in('symbol', symbols);

  const stockMap: Record<string, { ltp: number; sector: string | null; company_name: string }> = {};
  (stocks || []).forEach((s: any) => {
    stockMap[s.symbol] = { ltp: Number(s.ltp), sector: s.sector, company_name: s.company_name };
  });

  let totalInvestment = 0;
  let totalCurrentValue = 0;

  const assets: PortfolioAsset[] = (holdings as PortfolioItem[]).map(h => {
    const stock = stockMap[h.symbol] || { ltp: 0, sector: null, company_name: h.symbol };
    const investment = h.quantity * h.average_buy_price;
    const currentValue = h.quantity * stock.ltp;
    const pnl = currentValue - investment;
    const pnlPercentage = investment > 0 ? (pnl / investment) * 100 : 0;
    totalInvestment += investment;
    totalCurrentValue += currentValue;

    return {
      ...h,
      current_price: stock.ltp,
      investment,
      current_value: currentValue,
      pnl,
      pnl_percentage: pnlPercentage,
      sector: stock.sector,
      company_name: stock.company_name,
    };
  });

  const totalPnl = totalCurrentValue - totalInvestment;
  const overallPnlPercentage = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;

  return {
    assets,
    summary: {
      total_investment: totalInvestment,
      total_current_value: totalCurrentValue,
      total_pnl: totalPnl,
      overall_pnl_percentage: overallPnlPercentage,
    },
  };
}

// ─── Trading (authenticated, server-side validated) ────────

// NEPSE brokerage fee schedule (mirrors backend for preview)
const BROKERAGE_TIERS: [number, number][] = [
  [50_000, 0.0036],
  [500_000, 0.0033],
  [2_000_000, 0.0031],
  [10_000_000, 0.0027],
  [Infinity, 0.0024],
];
const SEBON_FEE_RATE = 0.00015;
const DP_CHARGE = 25;

export function estimateFees(tradeAmount: number): { brokerage: number; sebonFee: number; dpCharge: number; total: number } {
  let remaining = tradeAmount;
  let brokerage = 0;
  let prevLimit = 0;
  for (const [limit, rate] of BROKERAGE_TIERS) {
    const tierAmount = Math.min(remaining, limit - prevLimit);
    if (tierAmount <= 0) break;
    brokerage += tierAmount * rate;
    remaining -= tierAmount;
    prevLimit = limit;
  }
  const sebonFee = tradeAmount * SEBON_FEE_RATE;
  return {
    brokerage: Math.round(brokerage * 100) / 100,
    sebonFee: Math.round(sebonFee * 100) / 100,
    dpCharge: DP_CHARGE,
    total: Math.round((brokerage + sebonFee + DP_CHARGE) * 100) / 100,
  };
}

export async function executeTrade(
  symbol: string,
  quantity: number,
  action: 'BUY' | 'SELL'
): Promise<{ success: boolean; message: string }> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return { success: false, message: 'Not authenticated' };
  const userId = session.session.user.id;

  // ── Premium gate: check daily trade limit ──
  const sub = useSubscriptionStore.getState();
  const maxTrades = sub.getLimit('maxDailyTrades');
  if (maxTrades !== -1) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const { data: todayTrades } = await insforge.database
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .gte('timestamp', `${today}T00:00:00`);
    const todayCount = (todayTrades as unknown[] | null)?.length ?? 0;
    if (todayCount >= maxTrades) {
      return { success: false, message: `Daily trade limit reached (${maxTrades}). Upgrade your plan for more trades.` };
    }
  }

  // Get stock price
  const stock = await getStockBySymbol(symbol);
  if (!stock) return { success: false, message: 'Stock not found' };

  const price = stock.ltp;
  const tradeAmount = price * quantity;
  const fees = estimateFees(tradeAmount);

  // Get wallet
  const wallet = await getWallet();
  if (!wallet) return { success: false, message: 'Wallet not found' };

  // Use RPC for atomic server-side trade execution
  try {
    const { data, error } = await insforge.database.rpc('execute_trade', {
      p_user_id: userId,
      p_symbol: symbol.toUpperCase(),
      p_action: action,
      p_quantity: quantity,
      p_price: price,
      p_fees: fees.total,
    });

    if (error) {
      return { success: false, message: error.message || 'Trade execution failed. Server-side validation is required.' };
    }

    if (data && typeof data === 'object' && 'error' in data) {
      return { success: false, message: String(data.error) };
    }

    const feeStr = fees.total > 0 ? ` (fees: Rs. ${fees.total.toFixed(2)})` : '';
    return {
      success: true,
      message: `Successfully ${action === 'BUY' ? 'bought' : 'sold'} ${quantity} shares of ${symbol.toUpperCase()} at Rs. ${price.toFixed(2)}${feeStr}`,
    };
  } catch {
    return { success: false, message: 'Trade service unavailable. Please try again later.' };
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return [];
  const userId = session.session.user.id;

  const { data, error } = await insforge.database
    .from('transactions')
    .select()
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as Transaction[];
}

// ─── Watchlist (authenticated) ─────────────────────────────

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

// ─── Full Market Data Bundle (for Landing / Market pages) ──

export interface MarketBundle {
  summary: MarketSummary;
  subIndices: SubIndex[];
  topGainers: Stock[];
  topLosers: Stock[];
  topTurnovers: Stock[];
}

export async function getMarketBundle(): Promise<MarketBundle | null> {
  const [summary, subIndices, topGainers, topLosers, topTurnovers] = await Promise.all([
    getMarketSummary(),
    getSubIndices(),
    getTopGainers(10),
    getTopLosers(10),
    getTopTurnovers(10),
  ]);
  if (!summary) return null;
  return { summary, subIndices, topGainers, topLosers, topTurnovers };
}
