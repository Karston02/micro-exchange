import type { OrderBookSnapshot } from "./orderBookSnapshot";
import type { TradesSnapshot } from "./trade";

// used for WebSocket messages
export type MarketMessage =
  | { type: "orderbook"; data: OrderBookSnapshot }
  | { type: "trades"; data: TradesSnapshot };
