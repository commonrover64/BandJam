const pool = require("../../config/db");
const transporter = require("../../config/mailer");
const { createOTP, consumeOTP } = require("../../config/otp");
const { HttpError } = require("../../utils/httpError");

const getUserEmail = async (userId) => {
  const { rows } = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
  if (!rows[0]) throw new HttpError(404, "User not found");
  return rows[0].email.toLowerCase();
};

const sendOTP = async (userId) => {
  const email = await getUserEmail(userId);
  const otp = await createOTP(email, "verify_owner");

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Your verification OTP",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  });

  return { message: "OTP sent to your email" };
};

const verifyOTP = async (userId, otp) => {
  if (!otp) throw new HttpError(400, "OTP is required");
  const email = await getUserEmail(userId);
  await consumeOTP(email, "verify_owner", otp);

  // upsert — create profile if it doesn't exist, update if it does
  await pool.query(
    `INSERT INTO owner_profiles (user_id, residential_addr, id_document_url, payment_details, is_verified)
     VALUES ($1, '', '', '', TRUE)
     ON CONFLICT (user_id) DO UPDATE SET is_verified = TRUE`,
    [userId],
  );

  return { message: "Email verified successfully" };
};

const completeOnboarding = async (userId, { residential_addr, payment_details }) => {
  residential_addr = String(residential_addr ?? "").trim();
  payment_details = String(payment_details ?? "").trim();
  if (!residential_addr || !payment_details)
    throw new HttpError(400, "Address and payment details are required");

  const { rowCount } = await pool.query(
    `UPDATE owner_profiles
     SET residential_addr = $1, payment_details = $2
     WHERE user_id = $3 AND is_verified = TRUE`,
    [residential_addr, payment_details, userId],
  );
  if (rowCount === 0) throw new HttpError(400, "Please verify your email first");

  return { message: "Onboarding complete" };
};

const getOnboardingStatus = async (userId) => {
  const { rows } = await pool.query(
    "SELECT is_verified FROM owner_profiles WHERE user_id = $1",
    [userId],
  );
  return { is_verified: rows[0]?.is_verified || false };
};

module.exports = { sendOTP, verifyOTP, completeOnboarding, getOnboardingStatus };
