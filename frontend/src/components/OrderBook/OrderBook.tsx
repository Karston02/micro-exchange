import { useEffect, useState } from "react";
import type { OrderBookSnapshot, PriceLevel } from "../../types";
import "./OrderBook.css";

export function OrderBook() {
  const [data, setData] = useState<OrderBookSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/exchange/orderbook");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = (await res.json()) as OrderBookSnapshot;
        setData(json);
      } catch (e: unknown) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Failed to load order book");
      }
    };

    fetchOrderBook();
  }, []);

  if (error) {
    return (
      <p className="order-book__error">Error loading order book: {error}</p>
    );
  }

  if (!data) {
    return <p className="order-book__loading">Loading order book...</p>;
  }

  return (
    <div className="order-book">
      <h2 className="order-book__title">Order Book</h2>
      <p className="order-book__last-price">
        Last traded price:{" "}
        {data.last_traded_price !== null ? `$${data.last_traded_price}` : "—"}
      </p>

      <div className="order-book__tables">
        <div className="order-book__section order-book__section--bids">
          <h3 className="order-book__subtitle">Bids</h3>
          <table className="order-book__table order-book__table--bids">
            <thead>
              <tr>
                <th>Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.bids.map((level: PriceLevel, idx) => (
                <tr key={`bid-${idx}`}>
                  <td>{level.price}</td>
                  <td>{level.total_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="order-book__section order-book__section--asks">
          <h3 className="order-book__subtitle">Asks</h3>
          <table className="order-book__table order-book__table--asks">
            <thead>
              <tr>
                <th>Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.asks.map((level, idx) => (
                <tr key={`ask-${idx}`}>
                  <td>{level.price}</td>
                  <td>{level.total_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
