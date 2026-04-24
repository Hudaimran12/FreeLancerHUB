// server/server.js
// This is the main server file - the heart of our backend
// FreelanceHub backend server
const express = require("express");
const path = require("path");

const app = express(); // create the express application
const PORT = 3000;     // the server will run on port 3000


app.use(express.json());

// Parse URL-encoded data (for HTML forms)
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the /client folder
// This lets people visit our HTML pages in the browser
app.use(express.static(path.join(__dirname, "../client")));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
// Import our routes and attach them under /api
const serviceRoutes = require("./routes/services");
app.use("/api", serviceRoutes);

// ─── ROOT ROUTE ───────────────────────────────────────────────────────────────
// When someone visits http://localhost:3000 send them to index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
// If no route matched, return a 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
// Catches any errors thrown in our routes
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("─────────────────────────────────────────");
  console.log(`✅ FreelanceHub server is running!`);
  console.log(`🌐 Open: http://localhost:${PORT}`);
  console.log(`📡 API:  http://localhost:${PORT}/api/services`);
  console.log("─────────────────────────────────────────");
});
