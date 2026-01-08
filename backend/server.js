const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

const orders = [];


// health check
app.get("/", (req, res) => {
  res.send("Soft opening demand signal API is running");
});

app.post("/orders", (req, res) => {
  const { sku, quantity } = req.body;

  if (!sku || !quantity) {
    return res.status(400).json({
      error: "SKU and quantity are required"
    });
  }

  orders.push({
    sku,
    quantity,
    timestamp: new Date()
  });

  res.status(201).json({
    message: "Order received",
    totalOrders: orders.length
  });
});

app.get("/summary", (req, res) => {
  const summary = {};

  for (const order of orders) {
    if (!summary[order.sku]) {
      summary[order.sku] = 0;
    }
    summary[order.sku] += order.quantity;
  }

  res.json({
    totalOrders: orders.length,
    demandBySku: summary
  });
});

app.delete("/reset", (req, res) => {
  orders.length = 0;
  res.json({ message: "All orders reset", totalOrders: orders.length });
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
