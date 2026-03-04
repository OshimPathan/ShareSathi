// ─── Market Data (public, no auth required) ────────────────
import insforge from '../../lib/insforge';
import type {
  Stock,
  MarketSummary,
  SubIndex,
  HistoricalPrice,
  NewsItem,
  IpoData,
} from '../../types';

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

// ─── Full Market Data Bundle ───────────────────────────────

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
