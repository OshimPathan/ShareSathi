// ─── React hook for real-time market data via WebSocket ────
// Connects to the FastAPI WS endpoint, parses incoming messages,
// and pushes live data into the React Query cache so every hook
// that reads 'market-summary' / 'stocks' etc. gets instant updates.

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { marketWS } from '../services/websocket';

interface UseMarketWebSocketOptions {
  /** WebSocket URL override — defaults to VITE_WS_URL env var. */
  wsUrl?: string;
  /** Auth token for authenticated connections. */
  token?: string;
  /** Auto-connect on mount (default: true). */
  autoConnect?: boolean;
}

/**
 * Hook that connects to the backend WebSocket and updates React Query caches
 * with live market data as it arrives.
 *
 * Usage:
 * ```tsx
 * function Dashboard() {
 *   const { connected } = useMarketWebSocket();
 *   const { data: summary } = useMarketSummary(); // auto-updated via WS
 *   ...
 * }
 * ```
 */
export function useMarketWebSocket(options: UseMarketWebSocketOptions = {}) {
  const { wsUrl, token, autoConnect = true } = options;
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const cleanupRef = useRef<(() => void)[]>([]);

  const updateCache = useCallback(() => {
    // Listen to all incoming messages and map them to React Query cache keys.
    // The backend broadcasts JSON with { live, summary } shape.
    const unsub = marketWS.on('*', (msg: unknown) => {
      const data = msg as Record<string, unknown>;
      if (!data) return;

      // The backend ConnectionManager sends: { live: [...], summary: {...} }
      if (data.live) {
        queryClient.setQueryData(['stocks'], data.live);
      }
      if (data.summary) {
        queryClient.setQueryData(['market-summary'], data.summary);
      }
    });

    // Also listen for typed events if the backend starts sending them.
    const unsubMarket = marketWS.on('market_update', (payload: unknown) => {
      queryClient.setQueryData(['market-summary'], payload);
    });

    const unsubStocks = marketWS.on('stock_update', (payload: unknown) => {
      queryClient.setQueryData(['stocks'], payload);
    });

    return [unsub, unsubMarket, unsubStocks];
  }, [queryClient]);

  useEffect(() => {
    if (!autoConnect) return;

    marketWS.connect(wsUrl, token);
    cleanupRef.current = updateCache();

    // Poll connection status
    const statusInterval = setInterval(() => {
      setConnected(marketWS.connected);
    }, 2000);

    return () => {
      clearInterval(statusInterval);
      cleanupRef.current.forEach((fn) => fn());
      // Don't disconnect on unmount — singleton stays alive across page navigations.
      // Only disconnect on explicit logout or app teardown.
    };
  }, [wsUrl, token, autoConnect, updateCache]);

  const connect = useCallback(() => {
    marketWS.connect(wsUrl, token);
    cleanupRef.current = updateCache();
  }, [wsUrl, token, updateCache]);

  const disconnect = useCallback(() => {
    cleanupRef.current.forEach((fn) => fn());
    marketWS.disconnect();
    setConnected(false);
  }, []);

  return { connected, connect, disconnect };
}
