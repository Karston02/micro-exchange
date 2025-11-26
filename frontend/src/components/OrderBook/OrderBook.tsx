import type { PriceLevel } from "../../types";
import { useMarketFeed } from "../../hooks/useMarketFeed";
import "./OrderBook.css";

export function OrderBook() {
  const { orderbook: data, error } = useMarketFeed();

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
