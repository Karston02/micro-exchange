import type { ExecutedTrade } from "../../types";
import { Side } from "../../types/enums/side";
import { useMarketFeed } from "../../hooks/useMarketFeed";
import "./TradesList.css";

export function TradesList() {
  const { trades: data, error } = useMarketFeed();

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
          {data.trades.map((trade: ExecutedTrade, idx) => {
            const isBuy = trade.side === Side.BUY;
            const sideClass = isBuy ? "buy" : "sell";
            return (
              <tr
                key={`trade-${idx}`}
                className={`trades__row trades__row--${sideClass}`}
              >
                <td>
                  <span className={`pill pill--${sideClass}`}>
                    {isBuy ? "Buy" : "Sell"}
                  </span>
                </td>
                <td className="trades__price">${trade.price.toFixed(2)}</td>
                <td className="trades__qty">{trade.quantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
