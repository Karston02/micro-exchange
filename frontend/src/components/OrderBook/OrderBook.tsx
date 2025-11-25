import { useEffect, useState } from "react";
import type { OrderBookSnapshot, PriceLevel } from "../../types";

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
    return <p style={{ color: "red" }}>Error loading order book: {error}</p>;
  }

  if (!data) {
    return <p>Loading order book...</p>;
  }

  return (
    <div>
      <h2>Order Book</h2>
      <p>
        Last traded price:{" "}
        {data.last_traded_price !== null ? `$${data.last_traded_price}` : "—"}
      </p>

      <div style={{ display: "flex", gap: "1.5rem" }}>
        <div>
          <h3>Bids</h3>
          <table>
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

        <div>
          <h3>Asks</h3>
          <table>
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
