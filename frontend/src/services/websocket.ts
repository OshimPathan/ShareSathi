// ─── WebSocket Client for Real-Time Market Data ────────────
// Connects to the FastAPI WebSocket endpoint for live market updates.
// Falls back gracefully when the backend is unreachable.

type MessageHandler = (data: unknown) => void;

class MarketWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnect = 5;
  private _connected = false;

  get connected() {
    return this._connected;
  }

  connect(wsUrl?: string, token?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const baseUrl = wsUrl || import.meta.env.VITE_WS_URL;
    if (!baseUrl) {
      console.warn('[WS] No VITE_WS_URL set — skipping WebSocket connection');
      return;
    }

    const url = `${baseUrl}/ws${token ? `?token=${token}` : ''}`;

    try {
      this.ws = new WebSocket(url);
    } catch {
      console.warn('[WS] Failed to create WebSocket');
      return;
    }

    this.ws.onopen = () => {
      this._connected = true;
      this.reconnectAttempts = 0;
      console.info('[WS] Connected');

      // Keepalive ping every 30s
      this.pingTimer = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send('ping');
        }
      }, 30_000);
    };

    this.ws.onmessage = (event) => {
      if (event.data === 'pong') return;

      try {
        const msg = JSON.parse(event.data);
        const handlers = this.listeners.get(msg.type);
        handlers?.forEach(fn => fn(msg.data));

        // Also emit to wildcard listeners
        const wildcardHandlers = this.listeners.get('*');
        wildcardHandlers?.forEach(fn => fn(msg));
      } catch {
        // Non-JSON message, ignore
      }
    };

    this.ws.onclose = () => {
      this._connected = false;
      if (this.pingTimer) clearInterval(this.pingTimer);

      if (this.reconnectAttempts < this.maxReconnect) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30_000);
        this.reconnectAttempts++;
        console.info(`[WS] Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts})`);
        this.reconnectTimer = setTimeout(() => this.connect(wsUrl, token), delay);
      }
    };

    this.ws.onerror = () => {
      // Will trigger onclose, which handles reconnection
    };
  }

  /** Subscribe to a specific message type. Returns unsubscribe function. */
  on(eventType: string, handler: MessageHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);

    return () => {
      this.listeners.get(eventType)?.delete(handler);
    };
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.reconnectAttempts = this.maxReconnect; // prevent reconnection
    this.ws?.close();
    this.ws = null;
    this._connected = false;
  }
}

/** Singleton instance */
export const marketWS = new MarketWebSocket();
