import { useEffect, useState } from "react";
import { OrderBook } from "./components";

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
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "1.5rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1>Micro Exchange + Options Lab</h1>
        <p>
          Backend:{" "}
          {backendStatus === "checking"
            ? "checking..."
            : backendStatus === "ok"
            ? "✅ connected"
            : "❌ error"}
        </p>
      </header>

      <main>
        <OrderBook />
      </main>
    </div>
  );
}

export default App;
