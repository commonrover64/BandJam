require("dotenv").config({ quiet: true });
const { Pool, types } = require("pg");

// Return DATE columns as plain "YYYY-MM-DD" strings. By default pg turns them
// into JS Dates at *server-local* midnight, so the same booking serialised
// differently depending on which timezone the host runs in.
types.setTypeParser(1082, (v) => v);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX) || 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  // hosted Postgres (Neon/Supabase/Render) usually needs SSL
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
});

// CRITICAL: without this listener, an idle client dropped by the DB
// (restart, network blip, provider idle timeout) emits an 'error' event with
// no handler and Node kills the whole process. This was a random crash.
pool.on("error", (err) => {
  console.error("Postgres idle client error (pool will reconnect):", err.message);
});

module.exports = pool;
