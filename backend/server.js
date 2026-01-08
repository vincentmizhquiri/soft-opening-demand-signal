const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

const orders = [];
const dataFilePath = path.join(__dirname, "data", "orders.json");

// Read saved orders from file
function readOrdersFromFile() {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Write saved orders to file
function writeOrdersToFile(allOrders) {
  fs.writeFileSync(dataFilePath, JSON.stringify(allOrders, null, 2));
}


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

  const newOrder = {
  sku,
  quantity,
  timestamp: new Date().toISOString()
};

// Save for live dashboard
orders.push(newOrder);

// Save for historical record
const fileOrders = readOrdersFromFile();
fileOrders.push(newOrder);
writeOrdersToFile(fileOrders);


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
  res.json({ message: "Live orders reset (saved history preserved)", 
    totalOrders: orders.length });
});

app.get("/export", (req, res) => {
  const fileOrders = readOrdersFromFile();
  res.json({
    totalSavedOrders: fileOrders.length,
    orders: fileOrders
  });
});

app.get("/hourly", (req, res) => {
  const fileOrders = readOrdersFromFile();

  const hourlyTotals = {};         // { "15": 3, "16": 7 }
  const hourlyBySku = {};          // { "15": {beef_empanada: 2, chicken_empanada: 1}, ... }

  for (const order of fileOrders) {
    // Convert timestamp to New York local hour (0–23)
    const hour = new Date(order.timestamp).toLocaleString("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      hour12: false
    });

    // Initialize if needed
    if (!hourlyTotals[hour]) hourlyTotals[hour] = 0;
    if (!hourlyBySku[hour]) hourlyBySku[hour] = {};

    // Add totals
    hourlyTotals[hour] += order.quantity;

    // Add SKU breakdown
    if (!hourlyBySku[hour][order.sku]) hourlyBySku[hour][order.sku] = 0;
    hourlyBySku[hour][order.sku] += order.quantity;
  }

  res.json({
    timeZone: "America/New_York",
    hourlyTotals,
    hourlyBySku
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
