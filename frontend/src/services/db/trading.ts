// ─── Trading (authenticated, server-side validated) ────────
import insforge from '../../lib/insforge';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { getStockBySymbol } from './market';
import { getWallet } from './wallet';
import type { Transaction } from '../../types';

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
    const today = new Date().toISOString().slice(0, 10);
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
