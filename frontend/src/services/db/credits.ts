// ─── Practice Credits Service ──────────────────────────────
// Handles credit packages, user credit balance, practice trades
import insforge from '../../lib/insforge';
import { getStockBySymbol } from './market';
import { estimateFees } from './trading';
import type {
  CreditPackage,
  UserCredits,
  CreditTransaction,
  PracticePortfolioItem,
  PracticeTrade,
  PortfolioAsset,
} from '../../types';

// ── Credit Packages ──

export async function getCreditPackages(): Promise<CreditPackage[]> {
  const { data, error } = await insforge.database
    .from('credit_packages')
    .select()
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as CreditPackage[];
}

// ── User Credit Balance ──

export async function getUserCredits(): Promise<UserCredits | null> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return null;
  const userId = session.session.user.id;

  const { data, error } = await insforge.database
    .from('user_credits')
    .select()
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    // Auto-create credit record for new users (0 balance)
    const { data: newRecord, error: createErr } = await insforge.database
      .from('user_credits')
      .insert({ user_id: userId, balance: 0, total_purchased: 0, total_spent: 0 })
      .select()
      .single();
    if (createErr || !newRecord) return null;
    return newRecord as UserCredits;
  }
  return data as UserCredits;
}

// ── Purchase Credits ──

export async function purchaseCredits(
  packageId: string,
  paymentReference?: string
): Promise<{ success: boolean; message: string; credits?: UserCredits }> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return { success: false, message: 'Not authenticated' };
  const userId = session.session.user.id;

  // Get the package
  const { data: pkg } = await insforge.database
    .from('credit_packages')
    .select()
    .eq('id', packageId)
    .single();

  if (!pkg) return { success: false, message: 'Package not found' };

  const creditPkg = pkg as CreditPackage;
  const totalCredits = creditPkg.credits + creditPkg.bonus_credits;

  // Get or create user credits
  let userCredits = await getUserCredits();
  if (!userCredits) return { success: false, message: 'Failed to initialize credits' };

  // Update balance
  const newBalance = userCredits.balance + totalCredits;
  const newTotalPurchased = userCredits.total_purchased + totalCredits;

  const { error: updateErr } = await insforge.database
    .from('user_credits')
    .update({
      balance: newBalance,
      total_purchased: newTotalPurchased,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (updateErr) return { success: false, message: 'Failed to update credits' };

  // Log the transaction
  await insforge.database.from('credit_transactions').insert({
    user_id: userId,
    type: 'purchase',
    amount: totalCredits,
    balance_after: newBalance,
    description: `Purchased ${creditPkg.name} package — ${creditPkg.credits} credits${creditPkg.bonus_credits > 0 ? ` + ${creditPkg.bonus_credits} bonus` : ''}`,
    package_id: packageId,
    payment_reference: paymentReference || null,
  });

  return {
    success: true,
    message: `Successfully purchased ${totalCredits} credits!`,
    credits: { ...userCredits, balance: newBalance, total_purchased: newTotalPurchased },
  };
}

// ── Credit Transaction History ──

export async function getCreditTransactions(): Promise<CreditTransaction[]> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return [];
  const userId = session.session.user.id;

  const { data, error } = await insforge.database
    .from('credit_transactions')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data as CreditTransaction[];
}

// ── Practice Portfolio ──

export async function getPracticePortfolio(): Promise<PortfolioAsset[]> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return [];
  const userId = session.session.user.id;

  const { data, error } = await insforge.database
    .from('practice_portfolio')
    .select()
    .eq('user_id', userId);

  if (error || !data) return [];

  const items = (data as PracticePortfolioItem[]).filter(i => i.quantity > 0);

  // Enrich with current prices
  const enriched: PortfolioAsset[] = [];
  for (const item of items) {
    const stock = await getStockBySymbol(item.symbol);
    const currentPrice = stock?.ltp ?? item.average_buy_price;
    const investment = item.quantity * item.average_buy_price;
    const currentValue = item.quantity * currentPrice;
    const pnl = currentValue - investment;

    enriched.push({
      ...item,
      id: typeof item.id === 'string' ? parseInt(item.id, 10) || 0 : item.id as unknown as number,
      current_price: currentPrice,
      investment,
      current_value: currentValue,
      pnl,
      pnl_percentage: investment > 0 ? (pnl / investment) * 100 : 0,
      sector: stock?.sector ?? null,
      company_name: stock?.company_name ?? item.symbol,
    });
  }

  return enriched;
}

// ── Practice Trade History ──

export async function getPracticeTrades(): Promise<PracticeTrade[]> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return [];
  const userId = session.session.user.id;

  const { data, error } = await insforge.database
    .from('practice_trades')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data as PracticeTrade[];
}

// ── Execute Practice Trade (1 credit per trade) ──

const CREDITS_PER_TRADE = 1;

export async function executePracticeTrade(
  symbol: string,
  quantity: number,
  action: 'BUY' | 'SELL'
): Promise<{ success: boolean; message: string }> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return { success: false, message: 'Not authenticated' };
  const userId = session.session.user.id;

  // Check credit balance
  const credits = await getUserCredits();
  if (!credits || credits.balance < CREDITS_PER_TRADE) {
    return { success: false, message: `Insufficient credits. You need ${CREDITS_PER_TRADE} credit per trade. Purchase more credits to continue.` };
  }

  // Get stock price
  const stock = await getStockBySymbol(symbol);
  if (!stock) return { success: false, message: 'Stock not found' };

  const price = stock.ltp;
  const tradeAmount = price * quantity;
  const fees = estimateFees(tradeAmount);

  if (action === 'SELL') {
    // Check if user has enough shares
    const { data: holding } = await insforge.database
      .from('practice_portfolio')
      .select()
      .eq('user_id', userId)
      .eq('symbol', symbol.toUpperCase())
      .maybeSingle();

    const currentQty = (holding as PracticePortfolioItem | null)?.quantity ?? 0;
    if (currentQty < quantity) {
      return { success: false, message: `Insufficient shares. You hold ${currentQty} of ${symbol}.` };
    }
  }

  try {
    // 1. Debit credit
    const newBalance = credits.balance - CREDITS_PER_TRADE;
    const newSpent = credits.total_spent + CREDITS_PER_TRADE;

    await insforge.database
      .from('user_credits')
      .update({ balance: newBalance, total_spent: newSpent, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    // 2. Log credit transaction
    await insforge.database.from('credit_transactions').insert({
      user_id: userId,
      type: 'trade_debit',
      amount: -CREDITS_PER_TRADE,
      balance_after: newBalance,
      description: `${action} ${quantity}x ${symbol.toUpperCase()} @ Rs ${price.toFixed(2)}`,
    });

    // 3. Update practice portfolio
    if (action === 'BUY') {
      const { data: existing } = await insforge.database
        .from('practice_portfolio')
        .select()
        .eq('user_id', userId)
        .eq('symbol', symbol.toUpperCase())
        .maybeSingle();

      if (existing) {
        const ex = existing as PracticePortfolioItem;
        const totalQty = ex.quantity + quantity;
        const totalCost = ex.quantity * ex.average_buy_price + quantity * price;
        const newAvg = totalCost / totalQty;

        await insforge.database
          .from('practice_portfolio')
          .update({
            quantity: totalQty,
            average_buy_price: Math.round(newAvg * 100) / 100,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('symbol', symbol.toUpperCase());
      } else {
        await insforge.database.from('practice_portfolio').insert({
          user_id: userId,
          symbol: symbol.toUpperCase(),
          quantity,
          average_buy_price: price,
        });
      }
    } else {
      // SELL
      const { data: existing } = await insforge.database
        .from('practice_portfolio')
        .select()
        .eq('user_id', userId)
        .eq('symbol', symbol.toUpperCase())
        .maybeSingle();

      if (existing) {
        const ex = existing as PracticePortfolioItem;
        const remainingQty = ex.quantity - quantity;

        if (remainingQty <= 0) {
          await insforge.database
            .from('practice_portfolio')
            .delete()
            .eq('user_id', userId)
            .eq('symbol', symbol.toUpperCase());
        } else {
          await insforge.database
            .from('practice_portfolio')
            .update({ quantity: remainingQty, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('symbol', symbol.toUpperCase());
        }
      }
    }

    // 4. Record practice trade
    await insforge.database.from('practice_trades').insert({
      user_id: userId,
      symbol: symbol.toUpperCase(),
      action,
      quantity,
      price,
      credits_used: CREDITS_PER_TRADE,
      fees: fees.total,
    });

    const feeStr = fees.total > 0 ? ` (est. fees: Rs ${fees.total.toFixed(2)})` : '';
    return {
      success: true,
      message: `${action === 'BUY' ? 'Bought' : 'Sold'} ${quantity}x ${symbol.toUpperCase()} @ Rs ${price.toFixed(2)}${feeStr} — 1 credit used`,
    };
  } catch {
    return { success: false, message: 'Trade failed. Please try again.' };
  }
}
