import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

// Return DATE columns as plain "YYYY-MM-DD" strings instead of JS Date objects,
// which would otherwise shift by a day depending on the server timezone.
pg.types.setTypeParser(1082, (value) => value);

function buildConfig() {
  // Render (and most managed Postgres hosts) give you a single
  // DATABASE_URL. Locally, use the discrete DB_* variables instead.
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
      max: 10,
    };
  }
  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "health_tracker",
    max: 10,
  };
}

const pool = new Pool(buildConfig());

const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    age             INTEGER      NULL,
    gender          VARCHAR(20)  NULL,
    height_cm       REAL         NULL,
    target_weight   REAL         NULL,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
  );
`;

const CREATE_HEALTH_LOGS_TABLE = `
  CREATE TABLE IF NOT EXISTS health_logs (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date        DATE NOT NULL,
    weight_kg       REAL NOT NULL,
    height_cm       REAL NOT NULL,
    bmi             REAL NOT NULL,
    bmi_category    VARCHAR(20) NOT NULL,
    systolic_bp     INTEGER NULL,
    diastolic_bp    INTEGER NULL,
    resting_hr      INTEGER NULL,
    daily_steps     INTEGER NULL,
    water_liters    REAL NULL,
    sleep_hours     REAL NULL,
    notes           TEXT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const CREATE_HEALTH_LOGS_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_health_logs_user_date ON health_logs (user_id, log_date);
`;

/** Idempotently create the schema. Safe to call on every boot. */
export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(CREATE_USERS_TABLE);
    await client.query(CREATE_HEALTH_LOGS_TABLE);
    await client.query(CREATE_HEALTH_LOGS_INDEX);
  } finally {
    client.release();
  }
}

const TRANSIENT_CODES = new Set([
  "ECONNRESET", "ETIMEDOUT", "ECONNREFUSED",
  "57P03", // cannot connect now (DB starting up)
]);

/** Retry wrapper for transient connection failures. */
export async function withRetry(fn, { attempts = 3, backoffMs = 400 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < attempts && TRANSIENT_CODES.has(err.code)) {
        await new Promise((resolve) => setTimeout(resolve, backoffMs * attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export default pool;
