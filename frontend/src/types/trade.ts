export type ExecutedTrade = {
  price: number;
  quantity: number;
  side: "buy" | "sell";
  timestamp: string;
  ticker: string;
};

export type TradesSnapshot = {
  trades: ExecutedTrade[];
};
