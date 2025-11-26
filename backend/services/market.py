from datetime import datetime
from typing import Dict, List, Optional

from models.order import Order, OrderStatus, Side
from models.order_book import OrderBookSnapshot, PriceLevel
from models.trades import ExecutedTrade, TradesSnapshot

# in-memory state (phase 1)
orders: List[Order] = []
trades: List[ExecutedTrade] = []
last_traded_price: Optional[float] = 100.0
_next_order_id = 1


def place_order(side: Side, price: float, quantity: float) -> Order:
    global _next_order_id
    now = datetime.now()

    order = Order(
        id=_next_order_id,
        side=side,
        price=price,
        quantity=quantity,
        remaining_quantity=quantity,
        status=OrderStatus.OPEN,
        timestamp=now,
    )

    _next_order_id += 1
    orders.append(order)
    return order

"""
Builds a snapshot of the current order book, aggregating bids and asks by price level.
"""
def build_orderbook_snapshot() -> OrderBookSnapshot:
    bids_map: Dict[float, float] = {}
    asks_map: Dict[float, float] = {}

    # each order contributes to its price level's total quantity
    for order in orders:
        target = bids_map if order.side == Side.BUY else asks_map
        # this is a dict aggregation by price level (for level 2)
        target[order.price] = target.get(order.price, 0) + order.remaining_quantity

    bid_levels = [
        PriceLevel(price=price, total_quantity=qty)
        for price, qty in sorted(bids_map.items(), key=lambda item: item[0], reverse=True)
    ]
    ask_levels = [
        PriceLevel(price=price, total_quantity=qty)
        for price, qty in sorted(asks_map.items(), key=lambda item: item[0])
    ]

    return OrderBookSnapshot(
        bids=bid_levels,
        asks=ask_levels,
        last_traded_price=last_traded_price,
    )


def build_trades_snapshot() -> TradesSnapshot:
    return TradesSnapshot(trades=list(reversed(trades)))
