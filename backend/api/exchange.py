from fastapi import APIRouter
from models.order_book import PriceLevel, OrderBookSnapshot
from models.trades import ExecutedTrade, TradesSnapshot

router = APIRouter(prefix="/exchange", tags=["exchange"])


"""
Retrieves the current state of the order book, including bids, asks, and the last traded price.
"""
@router.get("/orderbook", response_model=OrderBookSnapshot)
def get_orderbook():
    # for now, return mock data
    bids = [
        PriceLevel(price=99.0, total_quantity=10),
        PriceLevel(price=98.5, total_quantity=15),
    ]
    asks = [
        PriceLevel(price=101.0, total_quantity=12),
        PriceLevel(price=101.5, total_quantity=8),
    ]
    return OrderBookSnapshot(
        bids=bids,
        asks=asks,
        last_traded_price=100.0,
    )


"""
Returns the latest executed trades (most recent first).
"""
@router.get("/trades", response_model=TradesSnapshot)
def get_trades():
    # just fake data for now
    trades = [
        ExecutedTrade(price=100.15, quantity=3.5, side="buy"),
        ExecutedTrade(price=100.0, quantity=1.25, side="sell"),
        ExecutedTrade(price=99.85, quantity=2.0, side="buy"),
        ExecutedTrade(price=99.75, quantity=4.1, side="sell"),
    ]
    return TradesSnapshot(trades=trades)
