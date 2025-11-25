# Micro Exchange + Options Lab

A simulated trading exchange with:

- In-memory limit order book + matching engine
- Real-time order book + trades via WebSocket
- Options pricing panel (Black-Scholes) driven by the simulated underlying price

## Goals (MVP)

- Single asset
- Limit orders only (buy/sell)
- In-memory order book and trades (no DB)
- REST API for:
  - Submitting orders
  - Fetching current order book
  - Fetching recent trades
- WebSocket for:
  - Order book updates
  - Trade executions
  - Price updates
- React UI for:
  - Order entry
  - Order book view
  - Trades feed
  - Options pricing panel (inputs + results)
  - Payoff chart for the option

## Non-goals (for now)

- Real money or real brokerage integration
- Authentication / users / permissions
- Multi-asset support
- Persistence across restarts
- Advanced order types (stop, iceberg, etc.)

## High-Level Architecture

- **Backend** (Python + FastAPI)

  - `/orders` (POST): submit orders
  - `/orderbook` (GET): current snapshot
  - `/trades` (GET): recent trades
  - `/ws/market` (WebSocket): pushes market updates
  - In-memory modules:
    - `OrderBook`: maintains bids/asks
    - `MatchingEngine`: matches incoming orders, emits trades
    - `MarketState`: tracks last traded price, mid price, etc.
  - `options_pricing`: functions for Black-Scholes & Greeks (may be backend or reused in frontend)

- **Frontend** (React + TypeScript)
  - Connects to REST for initial data
  - Connects to WebSocket for live updates
  - Components:
    - `OrderEntryForm`
    - `OrderBookView`
    - `TradesList`
    - `MarketHeader` (shows current price)
    - `OptionsPanel` (inputs + results)
    - `PayoffChart`
