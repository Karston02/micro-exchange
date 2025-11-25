from pydantic import BaseModel
from typing import List, Optional

"""
This model represents a price level in the order book,
including the price and the total quantity available at that price.

Example:
{
    "price": 100.5,
    "total_quantity": 25.0
}
"""
class PriceLevel(BaseModel):
    price: float
    total_quantity: float

"""
OrderBookSnapshot represents the state of the order book at a given moment.
To be more specific, this lists every bid and ask level along with their quantities,
as well as the last traded price.

Example:
{
    "bids": [
        {"price": 99.0, "total_quantity": 10},
        {"price": 98.5, "total_quantity": 15}
    ],
    "asks": [
        {"price": 101.0, "total_quantity": 12},
        {"price": 101.5, "total_quantity": 8}
    ],
    "last_traded_price": 100.0
}
"""
class OrderBookSnapshot(BaseModel):
    bids: List[PriceLevel]
    asks: List[PriceLevel]
    last_traded_price: Optional[float] = None
