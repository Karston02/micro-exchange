from fastapi import APIRouter, WebSocket, WebSocketDisconnect

# models
from models.order import Order, Side
from models.order_book import OrderBookSnapshot
from models.trades import TradesSnapshot

# business logic imports
from services.market import (
    place_order as place_order_service,
    build_orderbook_snapshot,
    build_trades_snapshot,
)

# websocket manager and broadcaster
from services.connections import manager, broadcast_market_update


router = APIRouter(prefix="/exchange", tags=["exchange"])

"""
Retrieves the current state of the order book, including bids, asks, and the last traded price.
"""
@router.get("/orderbook", response_model=OrderBookSnapshot)
def get_orderbook():
    return build_orderbook_snapshot()


"""
Returns the latest executed trades (most recent first).
"""
@router.get("/trades", response_model=TradesSnapshot)
def get_trades():
    # return our current trades in reverse order (most recent first)
    return build_trades_snapshot()

"""
Used to place a new order into the exchange.
"""
@router.post("/orders", response_model=Order)
async def place_order(side: Side, price: float, quantity: float):
    order = place_order_service(side=side, price=price, quantity=quantity)

    # broadcast updated market state
    await broadcast_market_update(
        build_orderbook_snapshot(),
        build_trades_snapshot(),
    )

    return order


"""
Used to retrieve current trading price
"""
@router.get("/price")
def get_price():
    snapshot = build_orderbook_snapshot()
    return {"last_traded_price": snapshot.last_traded_price}


"""
WebSocket feed for market updates (order book + trades).
"""
@router.websocket("/ws/market")
async def market_ws(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # send initial state
        await websocket.send_json({"type": "orderbook", "data": build_orderbook_snapshot().dict()})
        await websocket.send_json({"type": "trades", "data": build_trades_snapshot().dict()})

        while True:
            # we don't expect messages from clients yet; keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
