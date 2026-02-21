/**
 * Analytics utility — wraps Google Analytics 4 (gtag.js)
 *
 * Setup:
 * 1. Get your GA4 Measurement ID from https://analytics.google.com
 * 2. Set VITE_GA_MEASUREMENT_ID in frontend/.env
 * 3. Replace G-XXXXXXXXXX in index.html with the same ID
 *
 * Usage:
 *   import { trackEvent, trackPageView } from '../utils/analytics';
 *   trackEvent('trade_executed', { symbol: 'NABIL', action: 'BUY', quantity: 10 });
 *   trackPageView('/dashboard');
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
}

/** Track a custom event */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (!GA_ID) return;
  gtag('event', eventName, params);
}

/** Track a page view (call on route changes) */
export function trackPageView(path: string) {
  if (!GA_ID) return;
  gtag('config', GA_ID, { page_path: path });
}

/** Track key business events */
export const events = {
  signUp: () => trackEvent('sign_up', { method: 'email' }),
  login: (method: string) => trackEvent('login', { method }),
  trade: (symbol: string, action: string, qty: number) =>
    trackEvent('trade_executed', { symbol, action, quantity: qty }),
  addToWatchlist: (symbol: string) =>
    trackEvent('add_to_watchlist', { symbol }),
  viewStock: (symbol: string) =>
    trackEvent('view_stock', { symbol }),
  viewPricing: () => trackEvent('view_pricing'),
  upgradeClick: (tier: string) =>
    trackEvent('upgrade_click', { tier }),
};

export default { trackEvent, trackPageView, events };
