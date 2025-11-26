import { useContext } from "react";
import { MarketFeedContext } from "./MarketFeedProvider";

export function useMarketFeed() {
  const ctx = useContext(MarketFeedContext);
  if (!ctx) {
    throw new Error("useMarketFeed must be used within a MarketFeedProvider");
  }
  return ctx;
}
