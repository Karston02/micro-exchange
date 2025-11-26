from pydantic import BaseModel
from typing import List
from .order import Side

"""
Represents an executed trade including its price, quantity, and direction.

Example:
{
    "price": 100.25,
    "quantity": 5.0,
    "side": "BUY"
}
"""
class ExecutedTrade(BaseModel):
    price: float
    quantity: float
    side: Side
    timestamp: str
    ticker: str

"""
Container for a list of executed trades.
"""
class TradesSnapshot(BaseModel):
    trades: List[ExecutedTrade]
