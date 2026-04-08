const pool = require("../src/config/db");
const fs = require("fs");
const path = require("path");

const migrate = async () => {
  // create a migrations tracker table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      run_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // get all sql files from migrations folder, sorted
  const files = fs
    .readdirSync(path.join(__dirname, "/"))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    // check if this migration already ran
    const { rows } = await pool.query(
      "SELECT id FROM migrations WHERE filename = $1",
      [file],
    );

    if (rows.length === 0) {
      // run it
      const sql = fs.readFileSync(
        path.join(__dirname, "", file),
        "utf8",
      );
      await pool.query(sql);
      await pool.query("INSERT INTO migrations (filename) VALUES ($1)", [file]);
      console.log(`Migration ran: ${file}`);
    } else {
      console.log(`Already ran: ${file}`);
    }
  }
};

module.exports = migrate;
