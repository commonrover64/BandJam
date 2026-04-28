const pool = require("../../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../../config/mailer");

// register a new user (owner or consumer)
const registerUser = async ({ name, email, password, role, phone }) => {

  if(!phone) {
    throw new Error("Phone number is required");
  }
  // check if email already exists
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    throw new Error("Email already in use");
  }

  // hash the password before storing
  const hashed = await bcrypt.hash(password, 10);

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, role, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, phone`,
    [name, email, hashed, role, phone],
  );

  return rows[0];
};

// login — check email, compare password, return JWT
const loginUser = async ({ email, password }) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = rows[0];
  //   console.log("rows in login user: ",rows)

  if (!user) throw new Error("Invalid email or password");

  // bcrypt compares plain password against stored hash
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid email or password");

  // sign a JWT with user id and role, expires in 7 days
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

// get user by id — used in /me route
const getUserById = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, phone, instruments, created_at
     FROM users WHERE id = $1`,
    [id],
  );
  return rows[0];
};

const updateProfile = async (userId, { name }) => {
  const { rows } = await pool.query(
    `UPDATE users SET name = $1 WHERE id = $2
     RETURNING id, name, email, role, phone, instruments`,
    [name, userId],
  );
  return rows[0];
};

const updateInstruments = async (userId, instruments) => {
  // instruments is an array like ["guitarist", "vocalist"]
  const { rows } = await pool.query(
    `UPDATE users SET instruments = $1 WHERE id = $2
     RETURNING id, name, email, role, phone, instruments`,
    [instruments, userId],
  );
  return rows[0];
};

const updatePhone = async (userId, phone) => {
  const { rows } = await pool.query(
    `UPDATE users SET phone = $1 WHERE id = $2
     RETURNING id, name, email, role, phone, instruments`,
    [phone, userId],
  );
  return rows[0];
};

const forgotPassword = async (email) => {
  // check user exists
  const { rows } = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (!rows[0]) throw new Error("No account found with this email");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  // reuse existing otps table
  await pool.query("DELETE FROM otps WHERE email = $1", [email]);
  await pool.query(
    "INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)",
    [email, otp, expiresAt],
  );

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Reset your password",
    text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
  });

  return { message: "OTP sent to your email" };
};

const resetPassword = async (email, otp, newPassword) => {
  // verify OTP
  const { rows } = await pool.query(
    "SELECT * FROM otps WHERE email = $1 AND otp = $2",
    [email, otp],
  );
  const record = rows[0];
  if (!record) throw new Error("Invalid OTP");
  if (new Date() > new Date(record.expires_at))
    throw new Error("OTP has expired");

  // hash new password and update
  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE users SET password = $1 WHERE email = $2", [
    hashed,
    email,
  ]);

  // cleanup OTP
  await pool.query("DELETE FROM otps WHERE email = $1", [email]);

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
