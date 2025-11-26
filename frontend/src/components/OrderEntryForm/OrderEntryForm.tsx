import { type FormEvent, useState } from "react";
import type { Order } from "../../types";
import { Side } from "../../types/enums/side";
import "./OrderEntryForm.css";

export function OrderEntryForm() {
  const [side, setSide] = useState<Side>(Side.BUY);
  const [price, setPrice] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(1);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (price <= 0 || quantity <= 0) {
      setError("Price and quantity must be greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      const params = new URLSearchParams({
        side,
        price: price.toString(),
        quantity: quantity.toString(),
      });

      const res = await fetch(
        `http://127.0.0.1:8000/exchange/orders?${params.toString()}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // if successful, save it as the last order
      const json = (await res.json()) as Order;
      setLastOrder(json);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="order-entry">
      <div className="order-entry__header">
        <h2 className="order-entry__title">Order Entry</h2>
        <div className="order-entry__side-toggle" role="group">
          <button
            type="button"
            className={`side-chip ${
              side === Side.BUY ? "side-chip--active" : ""
            } side-chip--buy`}
            onClick={() => setSide(Side.BUY)}
          >
            Buy
          </button>
          <button
            type="button"
            className={`side-chip ${
              side === Side.SELL ? "side-chip--active" : ""
            } side-chip--sell`}
            onClick={() => setSide(Side.SELL)}
          >
            Sell
          </button>
        </div>
      </div>

      <form className="order-entry__form" onSubmit={handleSubmit}>
        <label className="order-entry__field">
          <span>Price</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </label>

        <label className="order-entry__field">
          <span>Quantity</span>
          <input
            type="number"
            step="1"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className={`order-entry__submit order-entry__submit--${
            side === Side.BUY ? "buy" : "sell"
          }`}
        >
          {submitting
            ? "Placing..."
            : `Place ${side === Side.BUY ? "Buy" : "Sell"} Order`}
        </button>

        {error && <p className="order-entry__error">{error}</p>}
      </form>

      {lastOrder && (
        <div className="order-entry__last">
          <p className="order-entry__last-label">Last order</p>
          <div className="order-entry__last-values">
            <span className={`pill pill--${lastOrder.side.toLowerCase()}`}>
              {lastOrder.side === Side.BUY ? "Buy" : "Sell"}
            </span>
            <span className="order-entry__last-text">
              {lastOrder.quantity} @ ${lastOrder.price}
            </span>
            <span className="order-entry__last-status">{lastOrder.status}</span>
          </div>
        </div>
      )}
    </div>
  );
}
