import { Router } from "express";
import pool, { withRetry } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateBmi, classifyBmi } from "../utils/health.js";

const router = Router();
router.use(requireAuth);

const LOG_COLUMNS = `id, user_id, log_date, weight_kg, height_cm, bmi, bmi_category,
  systolic_bp, diastolic_bp, resting_hr, daily_steps, water_liters, sleep_hours,
  notes, created_at`;

/** GET /api/logs?limit=90 — most recent logs, oldest first */
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 90, 365);
  try {
    const result = await withRetry(() =>
      pool.query(
        `SELECT * FROM (
           SELECT ${LOG_COLUMNS} FROM health_logs
           WHERE user_id = $1 ORDER BY log_date DESC LIMIT $2
         ) recent ORDER BY log_date ASC`,
        [req.user.id, limit]
      )
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Fetch logs error:", err);
    return res.status(500).json({ error: "Could not fetch logs" });
  }
});

/** POST /api/logs — create a new log entry (BMI computed server-side) */
router.post("/", async (req, res) => {
  const {
    weight_kg, height_cm, systolic_bp, diastolic_bp, resting_hr,
    daily_steps, water_liters, sleep_hours, notes, log_date,
  } = req.body;

  if (weight_kg == null || height_cm == null) {
    return res.status(400).json({ error: "weight_kg and height_cm are required" });
  }
  if (weight_kg <= 0 || height_cm <= 0) {
    return res.status(400).json({ error: "weight_kg and height_cm must be positive" });
  }

  try {
    const bmi = calculateBmi(Number(weight_kg), Number(height_cm));
    const bmiCategory = classifyBmi(bmi);
    const effectiveDate = log_date || new Date().toISOString().slice(0, 10);

    const insertResult = await withRetry(() =>
      pool.query(
        `INSERT INTO health_logs
          (user_id, log_date, weight_kg, height_cm, bmi, bmi_category,
           systolic_bp, diastolic_bp, resting_hr, daily_steps, water_liters,
           sleep_hours, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING id`,
        [
          req.user.id, effectiveDate, weight_kg, height_cm, bmi, bmiCategory,
          systolic_bp ?? null, diastolic_bp ?? null, resting_hr ?? null,
          daily_steps ?? null, water_liters ?? null, sleep_hours ?? null,
          notes ?? null,
        ]
      )
    );

    const fetched = await pool.query(
      `SELECT ${LOG_COLUMNS} FROM health_logs WHERE id = $1`,
      [insertResult.rows[0].id]
    );
    return res.status(201).json(fetched.rows[0]);
  } catch (err) {
    console.error("Create log error:", err);
    return res.status(500).json({ error: "Could not save log entry" });
  }
});

/** PATCH /api/logs/:id — update an existing entry the user owns */
router.patch("/:id", async (req, res) => {
  const logId = Number(req.params.id);
  const {
    weight_kg, height_cm, systolic_bp, diastolic_bp, resting_hr,
    daily_steps, water_liters, sleep_hours, notes, log_date,
  } = req.body;

  try {
    const existingResult = await withRetry(() =>
      pool.query("SELECT * FROM health_logs WHERE id = $1 AND user_id = $2", [logId, req.user.id])
    );
    const existing = existingResult.rows[0];
    if (!existing) return res.status(404).json({ error: "Log entry not found" });

    const newWeight = weight_kg ?? existing.weight_kg;
    const newHeight = height_cm ?? existing.height_cm;
    const bmi = calculateBmi(Number(newWeight), Number(newHeight));
    const bmiCategory = classifyBmi(bmi);

    await withRetry(() =>
      pool.query(
        `UPDATE health_logs SET
           weight_kg = $1, height_cm = $2, bmi = $3, bmi_category = $4,
           systolic_bp = $5, diastolic_bp = $6, resting_hr = $7, daily_steps = $8,
           water_liters = $9, sleep_hours = $10, notes = $11, log_date = $12
         WHERE id = $13 AND user_id = $14`,
        [
          newWeight, newHeight, bmi, bmiCategory,
          systolic_bp ?? existing.systolic_bp, diastolic_bp ?? existing.diastolic_bp,
          resting_hr ?? existing.resting_hr, daily_steps ?? existing.daily_steps,
          water_liters ?? existing.water_liters, sleep_hours ?? existing.sleep_hours,
          notes ?? existing.notes, log_date ?? existing.log_date,
          logId, req.user.id,
        ]
      )
    );

    const fetched = await pool.query(`SELECT ${LOG_COLUMNS} FROM health_logs WHERE id = $1`, [logId]);
    return res.json(fetched.rows[0]);
  } catch (err) {
    console.error("Update log error:", err);
    return res.status(500).json({ error: "Could not update log entry" });
  }
});

/** DELETE /api/logs/:id */
router.delete("/:id", async (req, res) => {
  const logId = Number(req.params.id);
  try {
    const result = await withRetry(() =>
      pool.query("DELETE FROM health_logs WHERE id = $1 AND user_id = $2", [logId, req.user.id])
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Log entry not found" });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete log error:", err);
    return res.status(500).json({ error: "Could not delete log entry" });
  }
});

export default router;
