// ============================================================
// ShareSathi – InsForge Database Service Layer
// Barrel re-export for backward compatibility.
// New code should import from the specific sub-modules directly.
// ============================================================

export {
  getMarketSummary,
  getSubIndices,
  getAllStocks,
  getStockBySymbol,
  searchStocks,
  getTopGainers,
  getTopLosers,
  getTopTurnovers,
  getStockHistory,
  getStocksBySector,
  getNews,
  getNewsCategories,
  getIpos,
  getMarketBundle,
} from './market';
export type { MarketBundle } from './market';

export { getWallet } from './wallet';

export { getPortfolio, getPublicPortfolio } from './portfolio';
export type { PublicPortfolioData } from './portfolio';

export { estimateFees, executeTrade, getTransactions } from './trading';

export {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updateWatchlistAlerts,
} from './watchlist';

export { getLeaderboard } from './leaderboard';
export type { LeaderboardEntry } from './leaderboard';

export {
  getCreditPackages,
  getUserCredits,
  purchaseCredits,
  getCreditTransactions,
  getPracticePortfolio,
  getPracticeTrades,
  executePracticeTrade,
} from './credits';
