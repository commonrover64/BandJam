const pool = require("../src/config/db");
const fs = require("fs");
const path = require("path");

// Each migration runs inside a transaction together with its bookkeeping row,
// so a half-applied migration can't be recorded as done (or vice versa).
// An advisory lock stops two instances from migrating at the same time.
const MIGRATION_LOCK_ID = 727274;

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_ID]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        run_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const files = fs
      .readdirSync(__dirname)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const { rows: done } = await client.query("SELECT filename FROM migrations");
    const applied = new Set(done.map((r) => r.filename));

    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = fs.readFileSync(path.join(__dirname, file), "utf8");
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO migrations (filename) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`Migration ran: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_ID]).catch(() => {});
    client.release();
  }
};

module.exports = migrate;
