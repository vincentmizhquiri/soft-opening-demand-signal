const express = require("express");
const app = express();
const PORT = 3001;

app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.send("Soft opening demand signal API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
