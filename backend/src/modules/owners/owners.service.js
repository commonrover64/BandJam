const pool = require("../../config/db");
const transporter = require("../../config/mailer");

// generate a random 6 digit OTP
const generateOTP = () =>{
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOTP = async (userId) => {
  // get user email from db
  const { rows } = await pool.query("SELECT email FROM users WHERE id = $1", [
    userId,
  ]);
  const user = rows[0];
  if (!user) throw new Error("User not found");

  const otp = generateOTP();

  // expires in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // delete any existing OTP for this email before creating new one
  await pool.query("DELETE FROM otps WHERE email = $1", [user.email]);

  // store new OTP in db
  await pool.query(
    "INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)",
    [user.email, otp, expiresAt],
  );

  // send email
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: "Your verification OTP",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  });

  return { message: "OTP sent to your email" };
};

const verifyOTP = async (userId, otp) => {
  const { rows: userRows } = await pool.query(
    "SELECT email FROM users WHERE id = $1",
    [userId],
  );
  const user = userRows[0];
  if (!user) throw new Error("User not found");

  // find the OTP record
  const { rows } = await pool.query(
    "SELECT * FROM otps WHERE email = $1 AND otp = $2",
    [user.email, otp],
  );
  const record = rows[0];

  if (!record) throw new Error("Invalid OTP");

  // check if expired
  if (new Date() > new Date(record.expires_at)) {
    throw new Error("OTP has expired");
  }

  // mark owner as verified in owner_profiles
  // upsert — create profile if doesn't exist, update if it does
  await pool.query(
    `INSERT INTO owner_profiles (user_id, residential_addr, id_document_url, payment_details, is_verified)
     VALUES ($1, '', '', '', TRUE)
     ON CONFLICT (user_id) DO UPDATE SET is_verified = TRUE`,
    [userId],
  );

  // delete OTP after successful verification
  await pool.query("DELETE FROM otps WHERE email = $1", [user.email]);

  return { message: "Email verified successfully" };
};

const completeOnboarding = async (
  userId,
  { residential_addr, payment_details },
) => {
  // check if user is verified first
  const { rows } = await pool.query(
    "SELECT is_verified FROM owner_profiles WHERE user_id = $1",
    [userId],
  );

  if (!rows[0] || !rows[0].is_verified) {
    throw new Error("Please verify your email first");
  }

  // update the rest of the onboarding details
  await pool.query(
    `UPDATE owner_profiles
     SET residential_addr = $1, payment_details = $2
     WHERE user_id = $3`,
    [residential_addr, payment_details, userId],
  );

  return { message: "Onboarding complete" };
};

module.exports = { sendOTP, verifyOTP, completeOnboarding };
