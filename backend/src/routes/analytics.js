import { Router } from "express";
import pool, { withRetry } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { buildSummary } from "../utils/health.js";

const router = Router();
router.use(requireAuth);

/** GET /api/analytics/summary?limit=90 — enriched logs + headline metrics */
router.get("/summary", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 90, 365);
  try {
    const result = await withRetry(() =>
      pool.query(
        `SELECT * FROM (
           SELECT * FROM health_logs WHERE user_id = $1 ORDER BY log_date DESC LIMIT $2
         ) recent ORDER BY log_date ASC`,
        [req.user.id, limit]
      )
    );
    return res.json(buildSummary(result.rows));
  } catch (err) {
    console.error("Analytics summary error:", err);
    return res.status(500).json({ error: "Could not build analytics summary" });
  }
});

/** GET /api/analytics/export?format=csv — full history as CSV */
router.get("/export", async (req, res) => {
  const format = (req.query.format || "csv").toLowerCase();
  if (format !== "csv") {
    return res.status(400).json({ error: "Only format=csv is currently supported" });
  }

  try {
    const result = await withRetry(() =>
      pool.query(
        `SELECT log_date, weight_kg, height_cm, bmi, bmi_category, systolic_bp,
                diastolic_bp, resting_hr, daily_steps, water_liters, sleep_hours, notes
         FROM health_logs WHERE user_id = $1 ORDER BY log_date ASC`,
        [req.user.id]
      )
    );

    const header = [
      "log_date", "weight_kg", "height_cm", "bmi", "bmi_category", "systolic_bp",
      "diastolic_bp", "resting_hr", "daily_steps", "water_liters", "sleep_hours", "notes",
    ];
    const escapeCsv = (value) => {
      if (value == null) return "";
      const str = String(value);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const csvLines = [
      header.join(","),
      ...result.rows.map((row) => header.map((col) => escapeCsv(row[col])).join(",")),
    ];

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=health-log-export.csv");
    return res.send(csvLines.join("\n"));
  } catch (err) {
    console.error("Export error:", err);
    return res.status(500).json({ error: "Could not export logs" });
  }
});

export default router;
