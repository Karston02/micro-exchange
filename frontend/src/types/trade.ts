import type { Side } from "./enums";

export type ExecutedTrade = {
  price: number;
  quantity: number;
  side: Side;
  timestamp: string;
  ticker: string;
};

export type TradesSnapshot = {
  trades: ExecutedTrade[];
};
