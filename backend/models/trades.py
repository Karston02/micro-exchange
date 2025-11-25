from pydantic import BaseModel
from typing import List

"""
Represents an executed trade including its price, quantity, and direction.

Example:
{
    "price": 100.25,
    "quantity": 5.0,
    "side": "buy"
}
"""
class ExecutedTrade(BaseModel):
    price: float
    quantity: float
    side: str  # "buy" or "sell"


"""
Container for a list of executed trades.
"""
class TradesSnapshot(BaseModel):
    trades: List[ExecutedTrade]
