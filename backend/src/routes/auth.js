import { Router } from "express";
import bcrypt from "bcryptjs";
import pool, { withRetry } from "../db.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const router = Router();
const SALT_ROUNDS = 12;

router.post("/register", async (req, res) => {
  const { username, password, age, gender, height_cm, target_weight } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await withRetry(() =>
      pool.query(
        `INSERT INTO users (username, password_hash, age, gender, height_cm, target_weight)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [username, passwordHash, age ?? null, gender ?? null, height_cm ?? null, target_weight ?? null]
      )
    );

    const insertId = result.rows[0].id;
    const token = signToken({ id: insertId, username });
    return res.status(201).json({
      token,
      user: { id: insertId, username, age, gender, height_cm, target_weight },
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Username is already taken" });
    }
    console.error("Register error:", err);
    return res.status(500).json({ error: "Could not register user" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const result = await withRetry(() =>
      pool.query("SELECT * FROM users WHERE username = $1", [username])
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Could not log in" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await withRetry(() =>
      pool.query(
        "SELECT id, username, age, gender, height_cm, target_weight, created_at FROM users WHERE id = $1",
        [req.user.id]
      )
    );
    if (!result.rows[0]) return res.status(404).json({ error: "User not found" });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Fetch profile error:", err);
    return res.status(500).json({ error: "Could not fetch profile" });
  }
});

router.patch("/me", requireAuth, async (req, res) => {
  const { age, gender, height_cm, target_weight } = req.body;
  const fields = [];
  const values = [];
  let index = 1;

  for (const [column, value] of Object.entries({ age, gender, height_cm, target_weight })) {
    if (value !== undefined) {
      fields.push(`${column} = $${index}`);
      values.push(value);
      index += 1;
    }
  }
  if (fields.length === 0) return res.json({ message: "Nothing to update" });

  values.push(req.user.id);
  try {
    await withRetry(() =>
      pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = $${index}`, values)
    );
    return res.json({ message: "Profile updated" });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ error: "Could not update profile" });
  }
});

export default router;
