const pool = require("../../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../../config/mailer");
const { createOTP, consumeOTP } = require("../../config/otp");
const { HttpError } = require("../../utils/httpError");

const normEmail = (email) => String(email ?? "").trim().toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const ROLES = ["owner", "consumer"];
const USER_FIELDS = "id, name, email, role, phone, instruments, created_at";

const registerUser = async ({ name, email, password, role, phone }) => {
  email = normEmail(email);
  name = String(name ?? "").trim();
  if (!name) throw new HttpError(400, "Name is required");
  if (!EMAIL_RE.test(email)) throw new HttpError(400, "Enter a valid email");
  if (!password || String(password).length < 6)
    throw new HttpError(400, "Password must be at least 6 characters");
  if (!ROLES.includes(role)) throw new HttpError(400, "Invalid role");
  if (!phone) throw new HttpError(400, "Phone number is required");

  const existing = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [email]);
  if (existing.rows.length > 0) throw new HttpError(409, "Email already in use");

  const hashed = await bcrypt.hash(String(password), 10);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, role, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, phone`,
    [name, email, hashed, role, phone],
  );
  return rows[0];
};

const loginUser = async ({ email, password }) => {
  email = normEmail(email);
  if (!email || !password) throw new HttpError(400, "Email and password are required");

  const { rows } = await pool.query("SELECT * FROM users WHERE LOWER(email) = $1", [email]);
  const user = rows[0];
  if (!user) throw new HttpError(401, "Invalid email or password");

  const match = await bcrypt.compare(String(password), user.password);
  if (!match) throw new HttpError(401, "Invalid email or password");

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
    algorithm: "HS256",
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      instruments: user.instruments,
    },
  };
};

const getUserById = async (id) => {
  const { rows } = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [id]);
  // deleted user with a still-valid token → 401 so the app logs out
  if (!rows[0]) throw new HttpError(401, "User no longer exists");
  return rows[0];
};

const updateProfile = async (userId, { name }) => {
  name = String(name ?? "").trim();
  if (!name) throw new HttpError(400, "Name is required");
  const { rows } = await pool.query(
    `UPDATE users SET name = $1 WHERE id = $2 RETURNING ${USER_FIELDS}`,
    [name, userId],
  );
  return rows[0];
};

const updateInstruments = async (userId, instruments) => {
  if (!Array.isArray(instruments) || !instruments.every((i) => typeof i === "string"))
    throw new HttpError(400, "instruments must be an array of strings");
  const { rows } = await pool.query(
    `UPDATE users SET instruments = $1 WHERE id = $2 RETURNING ${USER_FIELDS}`,
    [instruments.slice(0, 20), userId],
  );
  return rows[0];
};

const updatePhone = async (userId, phone) => {
  phone = String(phone ?? "").trim();
  if (!phone) throw new HttpError(400, "Phone is required");
  const { rows } = await pool.query(
    `UPDATE users SET phone = $1 WHERE id = $2 RETURNING ${USER_FIELDS}`,
    [phone, userId],
  );
  return rows[0];
};

const GENERIC_RESET_MSG = "If an account exists for this email, an OTP has been sent";

const forgotPassword = async (rawEmail) => {
  const email = normEmail(rawEmail);
  if (!EMAIL_RE.test(email)) throw new HttpError(400, "Enter a valid email");

  const { rows } = await pool.query("SELECT email FROM users WHERE LOWER(email) = $1", [email]);
  // same response either way, so this endpoint can't be used to check
  // which emails are registered
  if (!rows[0]) return { message: GENERIC_RESET_MSG };

  const otp = await createOTP(email, "reset_password");
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: rows[0].email,
    subject: "Reset your password",
    text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
  });
  return { message: GENERIC_RESET_MSG };
};

const resetPassword = async (rawEmail, otp, newPassword) => {
  const email = normEmail(rawEmail);
  if (!newPassword || String(newPassword).length < 6)
    throw new HttpError(400, "Password must be at least 6 characters");

  await consumeOTP(email, "reset_password", otp);

  const hashed = await bcrypt.hash(String(newPassword), 10);
  await pool.query("UPDATE users SET password = $1 WHERE LOWER(email) = $2", [hashed, email]);
  return { message: "Password reset successfully" };
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateProfile,
  updateInstruments,
  updatePhone,
  forgotPassword,
  resetPassword,
};
