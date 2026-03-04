// ─── Portfolio (authenticated) ─────────────────────────────
import insforge from '../../lib/insforge';
import type { PortfolioItem, PortfolioAsset, PortfolioSummary } from '../../types';

const EMPTY_SUMMARY: PortfolioSummary = { total_investment: 0, total_current_value: 0, total_pnl: 0, overall_pnl_percentage: 0 };

export async function getPortfolio(): Promise<{ assets: PortfolioAsset[]; summary: PortfolioSummary }> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return { assets: [], summary: EMPTY_SUMMARY };
  const userId = session.session.user.id;

  const { data: holdings, error } = await insforge.database
    .from('portfolio')
    .select()
    .eq('user_id', userId);
  if (error || !holdings || holdings.length === 0) {
    return { assets: [], summary: EMPTY_SUMMARY };
  }

  // Filter out zombie rows with zero quantity
  const activeHoldings = (holdings as PortfolioItem[]).filter(h => h.quantity > 0);
  if (activeHoldings.length === 0) {
    return { assets: [], summary: EMPTY_SUMMARY };
  }

  // Fetch current prices for all held symbols
  const symbols = activeHoldings.map(h => h.symbol);
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

  const assets: PortfolioAsset[] = activeHoldings.map(h => {
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

// ─── Public Portfolio (anyone can view by user_id) ─────────

export interface PublicPortfolioData {
  user_name: string;
  assets: PortfolioAsset[];
  summary: PortfolioSummary;
  total_trades: number;
}

export async function getPublicPortfolio(userId: string): Promise<PublicPortfolioData | null> {
  const { data: holdings, error } = await insforge.database
    .from('portfolio')
    .select('user_id, symbol, quantity, average_buy_price')
    .eq('user_id', userId);
  if (error || !holdings || holdings.length === 0) return null;

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
    return { ...h, current_price: stock.ltp, investment, current_value: currentValue, pnl, pnl_percentage: pnlPercentage, sector: stock.sector, company_name: stock.company_name };
  });

  const totalPnl = totalCurrentValue - totalInvestment;
  const overallPnlPercentage = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;

  // Name
  let userName = `Trader-${userId.slice(0, 6)}`;
  try {
    const { data: profiles } = await insforge.database.from('profiles').select('name').eq('id', userId).limit(1);
    if (profiles && profiles.length > 0 && (profiles[0] as any).name) userName = (profiles[0] as any).name;
  } catch {}

  // Trade count
  const { data: trades } = await insforge.database.from('transactions').select('id').eq('user_id', userId);
  const totalTrades = trades?.length || 0;

  return {
    user_name: userName,
    assets,
    summary: { total_investment: totalInvestment, total_current_value: totalCurrentValue, total_pnl: totalPnl, overall_pnl_percentage: overallPnlPercentage },
    total_trades: totalTrades,
  };
}
