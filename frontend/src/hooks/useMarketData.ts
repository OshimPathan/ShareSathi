// ─── React Query hooks for market data ─────────────────────
import { useQuery } from '@tanstack/react-query';
import {
  getMarketSummary,
  getSubIndices,
  getAllStocks,
  getTopGainers,
  getTopLosers,
  getTopTurnovers,
  getMarketBundle,
  getStockBySymbol,
  getStockHistory,
  getStocksBySector,
  getNews,
  getNewsCategories,
  getIpos,
  searchStocks,
} from '../services/db/market';

// ── Market Overview ─────────────────────────────────────────

export function useMarketSummary() {
  return useQuery({
    queryKey: ['market-summary'],
    queryFn: getMarketSummary,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useSubIndices() {
  return useQuery({
    queryKey: ['sub-indices'],
    queryFn: getSubIndices,
    staleTime: 60_000,
  });
}

export function useStocks() {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: getAllStocks,
    staleTime: 30_000,
  });
}

export function useTopGainers(limit = 10) {
  return useQuery({
    queryKey: ['top-gainers', limit],
    queryFn: () => getTopGainers(limit),
    staleTime: 30_000,
  });
}

export function useTopLosers(limit = 10) {
  return useQuery({
    queryKey: ['top-losers', limit],
    queryFn: () => getTopLosers(limit),
    staleTime: 30_000,
  });
}

export function useTopTurnovers(limit = 10) {
  return useQuery({
    queryKey: ['top-turnovers', limit],
    queryFn: () => getTopTurnovers(limit),
    staleTime: 30_000,
  });
}

export function useMarketBundle() {
  return useQuery({
    queryKey: ['market-bundle'],
    queryFn: getMarketBundle,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ── Individual Stock ────────────────────────────────────────

export function useStock(symbol: string) {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => getStockBySymbol(symbol),
    enabled: !!symbol,
    staleTime: 30_000,
  });
}

export function useStockHistory(symbol: string) {
  return useQuery({
    queryKey: ['stock-history', symbol],
    queryFn: () => getStockHistory(symbol),
    enabled: !!symbol,
    staleTime: 5 * 60_000, // 5 min — historical data doesn't change often
  });
}

export function useStocksBySector(sector: string) {
  return useQuery({
    queryKey: ['stocks-by-sector', sector],
    queryFn: () => getStocksBySector(sector),
    enabled: !!sector,
    staleTime: 60_000,
  });
}

export function useSearchStocks(query: string) {
  return useQuery({
    queryKey: ['search-stocks', query],
    queryFn: () => searchStocks(query),
    enabled: query.length >= 1,
    staleTime: 30_000,
  });
}

// ── News & IPO ──────────────────────────────────────────────

export function useNews(category?: string, limit = 20) {
  return useQuery({
    queryKey: ['news', category, limit],
    queryFn: () => getNews(category, limit),
    staleTime: 5 * 60_000,
  });
}

export function useNewsCategories() {
  return useQuery({
    queryKey: ['news-categories'],
    queryFn: getNewsCategories,
    staleTime: 10 * 60_000,
  });
}

export function useIpos() {
  return useQuery({
    queryKey: ['ipos'],
    queryFn: getIpos,
    staleTime: 5 * 60_000,
  });
}
