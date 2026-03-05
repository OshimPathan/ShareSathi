// ─── React Query hooks for trading, portfolio, wallet ──────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWallet } from '../services/db/wallet';
import { getPortfolio } from '../services/db/portfolio';
import { executeTrade, getTransactions } from '../services/db/trading';
import { getWatchlist, addToWatchlist, removeFromWatchlist, updateWatchlistAlerts } from '../services/db/watchlist';
import { getLeaderboard } from '../services/db/leaderboard';
import {
  getUserCredits,
  getCreditPackages,
  getCreditTransactions,
  getPracticePortfolio,
  getPracticeTrades,
  executePracticeTrade,
} from '../services/db/credits';

// ── Wallet ──────────────────────────────────────────────────

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: getWallet,
    staleTime: 10_000,
  });
}

// ── Portfolio ───────────────────────────────────────────────

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: getPortfolio,
    staleTime: 10_000,
  });
}

// ── Transactions ────────────────────────────────────────────

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
    staleTime: 10_000,
  });
}

// ── Trading ─────────────────────────────────────────────────

export function useTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ symbol, quantity, action }: { symbol: string; quantity: number; action: 'BUY' | 'SELL' }) =>
      executeTrade(symbol, quantity, action),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate all affected queries
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        queryClient.invalidateQueries({ queryKey: ['portfolio'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      }
    },
  });
}

// ── Watchlist ───────────────────────────────────────────────

export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: getWatchlist,
    staleTime: 10_000,
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (symbol: string) => addToWatchlist(symbol),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      }
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (symbol: string) => removeFromWatchlist(symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}

// ── Leaderboard ─────────────────────────────────────────────

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
    staleTime: 60_000,
  });
}

// ── Credits ─────────────────────────────────────────────────

export function useUserCredits() {
  return useQuery({
    queryKey: ['user-credits'],
    queryFn: getUserCredits,
    staleTime: 10_000,
  });
}

export function useCreditPackages() {
  return useQuery({
    queryKey: ['credit-packages'],
    queryFn: getCreditPackages,
    staleTime: 60_000,
  });
}

export function useCreditTransactions() {
  return useQuery({
    queryKey: ['credit-transactions'],
    queryFn: getCreditTransactions,
    staleTime: 10_000,
  });
}

export function usePracticePortfolio() {
  return useQuery({
    queryKey: ['practice-portfolio'],
    queryFn: getPracticePortfolio,
    staleTime: 10_000,
  });
}

// ── Watchlist Alerts ────────────────────────────────────────

export function useUpdateWatchlistAlerts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ symbol, targetPrice, stopLoss }: { symbol: string; targetPrice: number | null; stopLoss: number | null }) =>
      updateWatchlistAlerts(symbol, targetPrice, stopLoss),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}

// ── Practice Trading ────────────────────────────────────────

export function usePracticeTrades() {
  return useQuery({
    queryKey: ['practice-trades'],
    queryFn: getPracticeTrades,
    staleTime: 10_000,
  });
}

export function usePracticeTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ symbol, quantity, action }: { symbol: string; quantity: number; action: 'BUY' | 'SELL' }) =>
      executePracticeTrade(symbol, quantity, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['practice-trades'] });
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    },
  });
}
