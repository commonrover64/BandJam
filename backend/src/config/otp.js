const crypto = require("crypto");
const pool = require("./db");

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

// crypto.randomInt instead of Math.random (which is predictable)
const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

const createOTP = async (email, purpose) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await pool.query("DELETE FROM otps WHERE email = $1 AND purpose = $2", [email, purpose]);
  await pool.query(
    "INSERT INTO otps (email, otp, expires_at, purpose) VALUES ($1, $2, $3, $4)",
    [email, otp, expiresAt, purpose],
  );
  return otp;
};

// Checks the code and burns it on success. After MAX_ATTEMPTS wrong guesses
// the code is deleted — previously a 6-digit code could be brute-forced
// with unlimited guesses.
const consumeOTP = async (email, purpose, otp) => {
  const { rows } = await pool.query(
    "SELECT id, otp, expires_at, attempts FROM otps WHERE email = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1",
    [email, purpose],
  );
  const record = rows[0];
  if (!record) throw new Error("Invalid or expired OTP");

  if (new Date() > new Date(record.expires_at)) {
    await pool.query("DELETE FROM otps WHERE id = $1", [record.id]);
    throw new Error("OTP has expired");
  }

  const a = Buffer.from(String(record.otp));
  const b = Buffer.from(String(otp ?? ""));
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!ok) {
    const { rows: upd } = await pool.query(
      "UPDATE otps SET attempts = attempts + 1 WHERE id = $1 RETURNING attempts",
      [record.id],
    );
    if ((upd[0]?.attempts ?? MAX_ATTEMPTS) >= MAX_ATTEMPTS) {
      await pool.query("DELETE FROM otps WHERE id = $1", [record.id]);
      throw new Error("Too many wrong attempts. Request a new OTP.");
    }
    throw new Error("Invalid OTP");
  }

  await pool.query("DELETE FROM otps WHERE id = $1", [record.id]);
};

module.exports = { createOTP, consumeOTP };
