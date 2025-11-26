from typing import Dict, List

from fastapi import WebSocket

from models.order_book import OrderBookSnapshot
from models.trades import TradesSnapshot


"""
ConnectionManager handles active WebSocket connections and broadcasting messages to them.
It maintains a list of active connections and provides methods to connect, disconnect,
and broadcast messages in JSON format.
"""
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    # add a new connection to the active list
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    # remove a connection from the active list
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    # broadcast JSON message to all active connections
    async def broadcast_json(self, message: Dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)


manager = ConnectionManager()

"""
Broadcasts the latest market state (order book and trades) to all connected clients.
"""
async def broadcast_market_update(
    orderbook: OrderBookSnapshot, trades: TradesSnapshot
):
    await manager.broadcast_json({"type": "orderbook", "data": orderbook.dict()})
    await manager.broadcast_json({"type": "trades", "data": trades.dict()})
