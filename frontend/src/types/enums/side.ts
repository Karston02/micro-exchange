export const Side = {
  BUY: "BUY",
  SELL: "SELL",
} as const;

export type Side = (typeof Side)[keyof typeof Side];
