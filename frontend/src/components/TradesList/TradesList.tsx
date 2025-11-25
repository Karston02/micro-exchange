import { useEffect, useState } from "react";
import type { ExecutedTrade, TradesSnapshot } from "../../types";
import "./TradesList.css";

export function TradesList() {
  const [data, setData] = useState<TradesSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/exchange/trades");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as TradesSnapshot;
        setData(json);
      } catch (e: unknown) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Failed to load trades");
      }
    };

    fetchTrades();
  }, []);

  if (error) {
    return <p className="trades__error">Error loading trades: {error}</p>;
  }

  if (!data) {
    return <p className="trades__loading">Loading trades...</p>;
  }

  return (
    <div className="trades">
      <div className="trades__header">
        <h2 className="trades__title">Recent Trades</h2>
      </div>
      <table className="trades__table">
        <thead>
          <tr>
            <th>Side</th>
            <th>Price</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {data.trades.map((trade: ExecutedTrade, idx) => (
            <tr
              key={`trade-${idx}`}
              className={`trades__row trades__row--${trade.side}`}
            >
              <td>
                <span className={`pill pill--${trade.side}`}>
                  {trade.side === "buy" ? "Buy" : "Sell"}
                </span>
              </td>
              <td className="trades__price">${trade.price.toFixed(2)}</td>
              <td className="trades__qty">{trade.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
