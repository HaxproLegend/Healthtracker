import express from "express";
import cors from "cors";
import "dotenv/config";

import { initDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import logRoutes from "./routes/logs.js";
import analyticsRoutes from "./routes/analytics.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/analytics", analyticsRoutes);

// Centralized error handler — catches anything a route forgot to try/catch.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Health Tracker API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
