from datetime import datetime
from typing import Dict, List, Optional

from models.order import Order, OrderStatus, Side
from models.order_book import OrderBookSnapshot, PriceLevel
from models.trades import ExecutedTrade, TradesSnapshot

# in-memory state (phase 1)
orders: List[Order] = []
trades: List[ExecutedTrade] = []
last_traded_price: Optional[float] = None
_next_order_id = 1
_DEFAULT_TICKER = "AAPL"


"""
This function is responsible for placing a new order into the exchange.
It works in the following way:
1. Create the incoming order with a unique ID and timestamp.
2. Attempt to match the incoming order against existing orders on the opposite side of the book.
3. For each match, determine the traded quantity and price, update the remaining quantities and statuses
   of both the incoming and resting orders, and record the executed trade.
4. If the incoming order is not fully filled, add the remaining portion to the order book.
5. Return the incoming order with its final status.
"""
def place_order(side: Side, price: float, quantity: float):
    global _next_order_id, last_traded_price

    now = datetime.now()

    # create the incoming order
    incoming = Order(
        id=_next_order_id,
        side=side,
        price=price,
        quantity=quantity,
        remaining_quantity=quantity,
        status=OrderStatus.OPEN,
        timestamp=now,
    )
    _next_order_id += 1

    # get the opposite side orders that are still open
    def is_open(o: Order) -> bool:
        return o.status in (OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED)

    # separate open bids and asks
    open_bids = [o for o in orders if o.side == Side.BUY and is_open(o)]
    open_asks = [o for o in orders if o.side == Side.SELL and is_open(o)]

    # sort them for price-time priority
    # bids: highest price first, then oldest
    open_bids.sort(key=lambda o: (-o.price, o.timestamp))
    # asks: lowest price first, then oldest
    open_asks.sort(key=lambda o: (o.price, o.timestamp))

    # decide which list we are matching against
    if incoming.side == Side.BUY:
        # try to match against best asks
        book_side = open_asks
        def price_crosses(book_order: Order) -> bool:
            return book_order.price <= incoming.price
    else:
        # sell incoming, match against best bids
        book_side = open_bids
        def price_crosses(book_order: Order) -> bool:
            return book_order.price >= incoming.price

    # matching loop
    for resting in book_side:
        if incoming.remaining_quantity <= 0:
            break
        if not price_crosses(resting):
            # no more matchable orders (book is sorted)
            break

        # determine traded quantity
        traded_qty = min(incoming.remaining_quantity, resting.remaining_quantity)
        if traded_qty <= 0:
            continue

        # trade price convention: use resting order's price
        trade_price = resting.price

        # update quantities
        incoming.remaining_quantity -= traded_qty
        resting.remaining_quantity -= traded_qty

        # update statuses
        if resting.remaining_quantity == 0:
            resting.status = OrderStatus.FILLED
        else:
            resting.status = OrderStatus.PARTIALLY_FILLED

        if incoming.remaining_quantity == 0:
            incoming.status = OrderStatus.FILLED
        else:
            incoming.status = OrderStatus.PARTIALLY_FILLED

        # create Trade record
        trade = ExecutedTrade(
            price=trade_price,
            quantity=traded_qty,
            side=incoming.side,
            timestamp=datetime.utcnow().isoformat(),
            ticker=_DEFAULT_TICKER,
        )
        trades.append(trade)
        last_traded_price = trade_price

    # If after matching it still has quantity, add to order book
    if incoming.remaining_quantity > 0 and incoming.status == OrderStatus.OPEN:
        # Not matched at all
        orders.append(incoming)
    elif incoming.remaining_quantity > 0 and incoming.status == OrderStatus.PARTIALLY_FILLED:
        # Partially filled, remaining part rests in book
        orders.append(incoming)

    # If it was immediately fully filled, we might still want to store it for history
    if incoming.status == OrderStatus.FILLED and incoming not in orders:
        orders.append(incoming)

    return incoming


"""
Builds a snapshot of the current order book, aggregating bids and asks by price level.
"""
def build_orderbook_snapshot() -> OrderBookSnapshot:
    
    # filter open orders
    open_bids = [o for o in orders if o.side == Side.BUY and o.status in (OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED)]
    open_asks = [o for o in orders if o.side == Side.SELL and o.status in (OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED)]

    # aggregate by price level
    def aggregate_price_levels(open_orders, reverse: bool) -> list[PriceLevel]:
        levels: dict[float, float] = {}
        for o in open_orders:
            levels[o.price] = levels.get(o.price, 0.0) + o.remaining_quantity
        prices = sorted(levels.keys(), reverse=reverse)
        return [PriceLevel(price=p, total_quantity=levels[p]) for p in prices]

    bids_levels = aggregate_price_levels(open_bids, reverse=True)
    asks_levels = aggregate_price_levels(open_asks, reverse=False)

    return OrderBookSnapshot(
        bids=bids_levels,
        asks=asks_levels,
        last_traded_price=last_traded_price,
    )


def build_trades_snapshot() -> TradesSnapshot:
    return TradesSnapshot(trades=list(reversed(trades)))
