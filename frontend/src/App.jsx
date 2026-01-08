import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3001";

export default function App() {
  const [menu] = useState([
    { id: "beef_empanada", name: "Beef Empanada", price: 5 },
    { id: "chicken_empanada", name: "Chicken Empanada", price: 5 },
    { id: "cheese_empanada", name: "Cheese Empanada", price: 4 },
  ]);

  const [summary, setSummary] = useState({ totalOrders: 0, demandBySku: {} });
  const [hourly, setHourly] = useState({ hourlyTotals: {}, hourlyBySku: {} });
  const [message, setMessage] = useState("");

  async function fetchSummary() {
    try {
      const res = await fetch(`${API_BASE}/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Could not fetch summary. Is the backend running?");
    }
  }
async function fetchHourly() {
  try {
    const res = await fetch(`${API_BASE}/hourly`);
    const data = await res.json();
    setHourly(data);
  } catch (err) {
    console.error(err);
  }
}

  async function placeOrder(sku) {
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, quantity: 1 }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setMessage(errData.error || "Order failed.");
        return;
      }

      const data = await res.json();
      setMessage(`✅ Order received! Total orders: ${data.totalOrders}`);
      fetchSummary();
      fetchHourly();

    } catch (err) {
      console.error(err);
      setMessage("⚠️ Order failed. Is the backend running?");
    }
  }

  useEffect(() => {
  fetchSummary();
  fetchHourly();

  const interval = setInterval(() => {
    fetchSummary();
    fetchHourly();
  }, 5000);

  return () => clearInterval(interval);
  }, []);

function skuToName(sku) {
  const item = menu.find((m) => m.id === sku);
  return item ? item.name : sku;
}

async function resetOrders() {
  setMessage("");
  try {
    const res = await fetch(`${API_BASE}/reset`, { method: "DELETE" });
    const data = await res.json();
    setMessage("🧹 Demo reset — all orders cleared.");
    fetchSummary();
    fetchHourly();

  } catch (err) {
    console.error(err);
    setMessage("⚠️ Could not reset orders.");
  }
}

async function downloadExport() {
  try {
    const res = await fetch(`${API_BASE}/export`);
    const data = await res.json();

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `soft-opening-orders-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    setMessage("⚠️ Could not export orders.");
  }
}


  return (
  <div
    style={{
      fontFamily: "system-ui",
      padding: 24,
      maxWidth: 900,
      margin: "0 auto",
      color: "#1f2937",
      background: "#fff7ed", // warm cream background
      minHeight: "100vh"
    }}
>

      <h1 style={{ marginBottom: 8 }}>Empanada Soft Opening — Demand Signal</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        Capture real-time orders by SKU during the soft opening to pace small-batch cooking and reduce waste.
      </p>

      {message && (
  <div
    style={{
      padding: 12,
      background: "#dcfce7",
      color: "#14532d",
      borderRadius: 10,
      marginBottom: 16,
      border: "1px solid #86efac",
      fontWeight: 600
    }}
  >
    {message}
  </div>
)}

<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
  
  {/* LEFT COLUMN: MENU */}
  <div
    style={{
      padding: 18,
      background: "white",
      border: "1px solid #fde68a",
      borderRadius: 16,
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
    }}
  >
    
    <h2>Menu (3–4 SKUs)</h2>

    {menu.map((item) => (
      <div
        key={item.id}
        style={{
          background: "white",
          border: "1px solid #fde68a",
          borderRadius: 16,
          padding: 16,
          marginBottom: 14,
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{item.name}</div>
          <div style={{ color: "#6b7280", marginTop: 6 }}>${item.price}</div>
        </div>

        <button
          onClick={() => placeOrder(item.id)}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "none",
            background: "#f97316",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
            minWidth: 110,
            boxShadow: "0 2px 8px rgba(249, 115, 22, 0.35)"
          }}
        >
          Order
        </button>
      </div>
    ))}
  </div>

  {/* RIGHT COLUMN: SUMMARY */}
  <div
    style={{
      padding: 18,
      background: "white",
      border: "1px solid #fde68a",
      borderRadius: 16,
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
    }}
  >
   <h2>Live Demand Summary</h2>

<div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
  <button
    onClick={resetOrders}
    style={{
      padding: "8px 12px",
      borderRadius: 10,
      border: "1px solid #f97316",
      background: "white",
      color: "#9a3412",
      fontWeight: 700,
      cursor: "pointer"
    }}
  >
    Reset Live View
  </button>

  <button
    onClick={downloadExport}
    style={{
      padding: "8px 12px",
      borderRadius: 10,
      border: "none",
      background: "#15803d",
      color: "white",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(21, 128, 61, 0.35)"
    }}
  >
    Download Export
  </button>
</div>


    <p><strong>Total Orders:</strong> {summary.totalOrders}</p>

    <h3>Demand by SKU</h3>
    {Object.keys(summary.demandBySku).length === 0 ? (
      <p style={{ color: "#6b7280" }}>No orders yet.</p>
    ) : (
      <ul>
        {Object.entries(summary.demandBySku).map(([sku, qty]) => (
          <li key={sku}>
            <strong>{skuToName(sku)}</strong>: {qty}
          </li>
        ))}
      </ul>
      
    )}

<h3 style={{ marginTop: 18 }}>Orders by Hour (EST)</h3>

{hourly.hourlyTotals && Object.keys(hourly.hourlyTotals).length === 0 ? (
  <p style={{ color: "#6b7280" }}>No hourly data yet.</p>
) : (
  <ul>
    {Object.entries(hourly.hourlyTotals).map(([hour, total]) => (
      <li key={hour} style={{ marginBottom: 10 }}>
        <strong>{hour}:00</strong> — {total} total orders

        {hourly.hourlyBySku?.[hour] && (
          <ul style={{ marginTop: 6 }}>
            {Object.entries(hourly.hourlyBySku[hour]).map(([sku, qty]) => (
              <li key={sku}>
                {skuToName(sku)}: {qty}
              </li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ul>
)}

    <p style={{ color: "#6b7280", marginTop: 16 }}>
      Auto-refreshes every 5 seconds.
    </p>
  </div>

</div>

      <div style={{ marginTop: 24, color: "#666" }}>
        <p>
          <strong>Context:</strong> Soft opening in East Williamsburg between Grimms Artisanal Ales and Viva Toro.
          No historical demand → we use live orders as the demand signal.
        </p>
      </div>
    </div>
  );
}
