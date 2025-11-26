from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class Side(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class OrderStatus(str, Enum):
    OPEN = "OPEN"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    FILLED = "FILLED"
    CANCELLED = "CANCELLED"


class Order(BaseModel):
    id: int
    side: Side
    price: float
    quantity: float
    remaining_quantity: float
    status: OrderStatus
    timestamp: datetime
