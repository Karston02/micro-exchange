import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  MarketMessage,
  OrderBookSnapshot,
  TradesSnapshot,
} from "../types";

type FeedStatus = "connecting" | "open" | "closed" | "error";

type MarketFeedContextValue = {
  orderbook: OrderBookSnapshot | null;
  trades: TradesSnapshot | null;
  lastTradedPrice: number | null;
  status: FeedStatus;
  error: string | null;
};

// eslint-disable-next-line react-refresh/only-export-components
export const MarketFeedContext = createContext<
  MarketFeedContextValue | undefined
>(undefined);

/**
 * This provider is responsible for connecting to the market data WebSocket
 * and managing the state of the order book and trades. Any component that
 * needs market data can consume this context.
 * @param children The child components that will have access to the market feed context
 * @returns The MarketFeedProvider component
 */
export function MarketFeedProvider({ children }: { children: ReactNode }) {
  const [orderbook, setOrderbook] = useState<OrderBookSnapshot | null>(null);
  const [trades, setTrades] = useState<TradesSnapshot | null>(null);
  const [lastTradedPrice, setLastTradedPrice] = useState<number | null>(null);
  const [status, setStatus] = useState<FeedStatus>("connecting");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    // connect to socket and set up handlers
    const connect = () => {
      setStatus("connecting");
      ws = new WebSocket("ws://127.0.0.1:8000/exchange/ws/market");

      ws.onopen = () => {
        setStatus("open");
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as MarketMessage;
          if (msg.type === "orderbook") {
            setOrderbook(msg.data);
            setLastTradedPrice(msg.data.last_traded_price ?? null);
          } else if (msg.type === "trades") {
            setTrades(msg.data);
          }
        } catch (err) {
          console.error("Failed to parse market message", err);
          setError("Failed to parse market message");
        }
      };

      ws.onerror = () => {
        setStatus("error");
        ws?.close();
      };

      ws.onclose = () => {
        if (!stopped) {
          setStatus("closed");
          reconnectTimer = setTimeout(connect, 1500);
        }
      };
    };

    connect();

    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  const value = useMemo(
    () => ({ orderbook, trades, lastTradedPrice, status, error }),
    [orderbook, trades, lastTradedPrice, status, error]
  );

  return (
    <MarketFeedContext.Provider value={value}>
      {children}
    </MarketFeedContext.Provider>
  );
}
