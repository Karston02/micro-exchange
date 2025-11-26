import { useEffect, useState } from "react";
import { OrderBook, TradesList, OrderEntryForm } from "./components";
import { MarketFeedProvider } from "./hooks/MarketFeedProvider";
import "./App.css";

function App() {
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "ok" | "error"
  >("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/health");
        if (!res.ok) throw new Error();
        await res.json();
        setBackendStatus("ok");
      } catch {
        setBackendStatus("error");
      }
    };

    checkHealth();
  }, []);

  return (
    <MarketFeedProvider>
      <div className="app">
        <header className="app__header">
          <div>
            <p className="app__eyebrow">Micro Exchange</p>
            <h1 className="app__title">Options Lab</h1>
          </div>
          <div
            className={`status-pill status-pill--${
              backendStatus === "error"
                ? "error"
                : backendStatus === "ok"
                ? "ok"
                : "checking"
            }`}
          >
            <span className="status-pill__dot" />
            {backendStatus === "checking"
              ? "Checking connection..."
              : backendStatus === "ok"
              ? "Connected"
              : "Connection Error"}
          </div>
        </header>

        <main className="app__main">
          <div className="app__panel app__panel--full">
            <OrderEntryForm />
          </div>
          <div className="app__panel">
            <OrderBook />
          </div>
          <div className="app__panel">
            <TradesList />
          </div>
        </main>
      </div>
    </MarketFeedProvider>
  );
}

export default App;
