import { useMemo, useState } from "react";
import type { Data, Layout } from "plotly.js-dist-min";
import Plot from "react-plotly.js";
import { useMarketFeed } from "../../hooks/useMarketFeed";
import "./OptionPricing.css";

type OptionType = "call" | "put";

function cdf(x: number) {
  // approximation of the standard normal CDF (abramowitz-stegun)
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * absX);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const erf =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return 0.5 * (1 + sign * erf);
}

function pdf(x: number) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

function blackScholes(
  S: number,
  K: number,
  T: number, // in years
  r: number, // risk-free (decimal)
  sigma: number, // vol (decimal)
  type: OptionType
) {
  const d1 =
    (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const callPrice = S * cdf(d1) - K * Math.exp(-r * T) * cdf(d2);
  const putPrice = K * Math.exp(-r * T) * cdf(-d2) - S * cdf(-d1);

  const price = type === "call" ? callPrice : putPrice;
  const delta = type === "call" ? cdf(d1) : cdf(d1) - 1;
  const gamma = pdf(d1) / (S * sigma * Math.sqrt(T));
  const vega = S * pdf(d1) * Math.sqrt(T) * 0.01; // per 1% vol
  const thetaCall =
    (-S * pdf(d1) * sigma) / (2 * Math.sqrt(T)) -
    r * K * Math.exp(-r * T) * cdf(d2);
  const thetaPut =
    (-S * pdf(d1) * sigma) / (2 * Math.sqrt(T)) +
    r * K * Math.exp(-r * T) * cdf(-d2);
  const theta = (type === "call" ? thetaCall : thetaPut) / 365; // per day
  const rhoCall = K * T * Math.exp(-r * T) * cdf(d2) * 0.01;
  const rhoPut = -K * T * Math.exp(-r * T) * cdf(-d2) * 0.01;
  const rho = type === "call" ? rhoCall : rhoPut;

  return { price, delta, gamma, vega, theta, rho };
}

export function OptionPricing() {
  const { lastTradedPrice } = useMarketFeed();
  const [underlying, setUnderlying] = useState<number>(lastTradedPrice ?? 100);
  const [strike, setStrike] = useState<number>(100);
  const [days, setDays] = useState<number>(30);
  const [vol, setVol] = useState<number>(30); // %
  const [rate, setRate] = useState<number>(5); // %
  const [optionType, setOptionType] = useState<OptionType>("call");

  const results = useMemo(() => {
    const T = Math.max(days, 0.0001) / 365;
    const sigma = Math.max(vol, 0.0001) / 100;
    const r = rate / 100;
    return blackScholes(underlying, strike, T, r, sigma, optionType);
  }, [underlying, strike, days, vol, rate, optionType]);

  const surface = useMemo(() => {
    const spot = underlying || 100;
    const strikes = Array.from({ length: 24 }, (_, i) => {
      const pct = 0.6 + (i / 23) * 1.0; // 60% to 160% of spot
      return Number((spot * pct).toFixed(2));
    });
    const tenors = Array.from({ length: 16 }, (_, i) => 7 + i * 21); // days
    const sigma = Math.max(vol, 0.0001) / 100;
    const r = rate / 100;

    const z = tenors.map((d) => {
      const tYears = Math.max(d, 0.01) / 365;
      return strikes.map(
        (k) => blackScholes(spot, k, tYears, r, sigma, optionType).price
      );
    });

    return { strikes, tenors, z };
  }, [underlying, vol, rate, optionType]);

  const plotData: Data[] = [
    {
      type: "surface",
      x: surface.strikes,
      y: surface.tenors,
      z: surface.z,
      colorscale: "Viridis",
      showscale: false,
    },
  ];

  const plotLayout: Partial<Layout> = {
    autosize: true,
    margin: { l: 0, r: 0, b: 0, t: 20 },
    scene: {
      xaxis: { title: { text: "Strike" } },
      yaxis: { title: { text: "Days to Expiry" } },
      zaxis: { title: { text: "Price" } },
      camera: { eye: { x: 1.4, y: -1.4, z: 1.1 } },
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { color: "#e5e7eb" },
  };

  return (
    <div className="option-pricing">
      <div className="option-pricing__header">
        <h2 className="option-pricing__title">Black-Scholes</h2>
        <div className="option-pricing__last">
          Spot:{" "}
          <span className="option-pricing__spot">
            {underlying ? `$${underlying.toFixed(2)}` : "—"}
          </span>
        </div>
      </div>

      <div className="option-pricing__grid">
        <label className="option-pricing__field">
          <span>Type</span>
          <div className="option-pricing__toggle">
            <button
              type="button"
              className={`option-type ${
                optionType === "call" ? "option-type--active" : ""
              }`}
              onClick={() => setOptionType("call")}
            >
              Call
            </button>
            <button
              type="button"
              className={`option-type ${
                optionType === "put" ? "option-type--active" : ""
              }`}
              onClick={() => setOptionType("put")}
            >
              Put
            </button>
          </div>
        </label>

        <label className="option-pricing__field">
          <span>Underlying (S)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={underlying}
            onChange={(e) => setUnderlying(Number(e.target.value))}
          />
        </label>

        <label className="option-pricing__field">
          <span>Strike (K)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={strike}
            onChange={(e) => setStrike(Number(e.target.value))}
          />
        </label>

        <label className="option-pricing__field">
          <span>Days to Expiry</span>
          <input
            type="number"
            min="0.01"
            step="1"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </label>

        <label className="option-pricing__field">
          <span>Volatility (%)</span>
          <input
            type="number"
            min="0.01"
            step="0.1"
            value={vol}
            onChange={(e) => setVol(Number(e.target.value))}
          />
        </label>

        <label className="option-pricing__field">
          <span>Risk-free Rate (%)</span>
          <input
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="option-pricing__results">
        <div className="option-pricing__price">
          <span>Theoretical Price</span>
          <strong>${results.price.toFixed(2)}</strong>
        </div>
        <div className="option-pricing__greeks">
          <div>
            <span>Delta</span>
            <strong>{results.delta.toFixed(3)}</strong>
          </div>
          <div>
            <span>Gamma</span>
            <strong>{results.gamma.toFixed(4)}</strong>
          </div>
          <div>
            <span>Vega</span>
            <strong>{results.vega.toFixed(2)}</strong>
          </div>
          <div>
            <span>Theta (per day)</span>
            <strong>{results.theta.toFixed(2)}</strong>
          </div>
          <div>
            <span>Rho</span>
            <strong>{results.rho.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div className="option-pricing__surface">
        <h3 className="option-pricing__surface-title">
          Price Surface (Strike vs Days)
        </h3>
        <Plot
          data={plotData}
          layout={plotLayout}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: "100%", height: "420px" }}
        />
      </div>
    </div>
  );
}
