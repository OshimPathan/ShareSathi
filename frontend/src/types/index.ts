// ============================================================
// ShareSathi - Shared TypeScript Types
// ============================================================

// === Market Data ===
export interface Stock {
  symbol: string;
  company_name: string;
  sector: string | null;
  total_listed_shares: number | null;
  ltp: number;
  previous_close: number;
  point_change: number;
  percentage_change: number;
  volume: number;
  turnover: number;
  high: number;
  low: number;
  open_price: number;
}

export interface MarketSummary {
  nepse_index: number;
  percentage_change: number;
  point_change: number;
  total_turnover: number;
  total_traded_shares: number;
  total_transactions: number;
  market_status: string;
  updated_at: string;
}

export interface SubIndex {
  id: number;
  sector: string;
  value: number;
  change: number;
  percentage_change: number;
}

export interface HistoricalPrice {
  id: number;
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// === User Data ===
export interface WalletData {
  id: number;
  user_id: string;
  balance: number;
}

export interface PortfolioItem {
  id: number;
  user_id: string;
  symbol: string;
  quantity: number;
  average_buy_price: number;
}

export interface PortfolioAsset extends PortfolioItem {
  current_price: number;
  investment: number;
  current_value: number;
  pnl: number;
  pnl_percentage: number;
  sector: string | null;
  company_name: string;
}

export interface PortfolioSummary {
  total_investment: number;
  total_current_value: number;
  total_pnl: number;
  overall_pnl_percentage: number;
}

export interface Transaction {
  id: number;
  user_id: string;
  symbol: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
}

export interface WatchlistItem {
  id: number;
  user_id: string;
  symbol: string;
  target_price: number | null;
  stop_loss: number | null;
  created_at: string;
  // Joined data
  current_price?: number;
  company_name?: string;
  sector?: string;
  percentage_change?: number;
}

// === News & IPO ===
export interface NewsItem {
  id: number;
  title: string;
  category: string;
  source: string;
  published_at: string;
  url: string | null;
  content: string | null;
}

export interface IpoData {
  id: number;
  company_name: string;
  sector: string;
  units: string;
  status: 'OPEN' | 'UPCOMING' | 'CLOSED';
  opening_date: string;
  closing_date: string;
}

// === Auth (matches authStore) ===
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  emailVerified: boolean;
  providers: string[];
  createdAt: string;
  updatedAt: string;
}
