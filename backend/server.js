const express = require("express");
const app = express();
const PORT = 3001;

app.use(express.json());
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


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
