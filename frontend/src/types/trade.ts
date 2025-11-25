export type ExecutedTrade = {
  price: number;
  quantity: number;
  side: "buy" | "sell";
};

export type TradesSnapshot = {
  trades: ExecutedTrade[];
};
