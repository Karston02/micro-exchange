import type { PriceLevel } from "./priceLevel.ts";

export type OrderBookSnapshot = {
  bids: PriceLevel[];
  asks: PriceLevel[];
  last_traded_price: number | null;
};
