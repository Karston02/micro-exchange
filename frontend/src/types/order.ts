import type { Side } from "./enums/side";
import type { OrderStatus } from "./enums/orderStatus";

export type Order = {
  id: number;
  side: Side;
  price: number;
  quantity: number;
  remaining_quantity: number;
  status: OrderStatus;
  timestamp: string;
};
