const pool = require("../config/db");

const requireVerified = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT is_verified FROM owner_profiles WHERE user_id = $1",
      [req.user.id],
    );
    if (!rows[0] || !rows[0].is_verified) {
      return res.status(403).json({
        success: false,
        message: "Please complete onboarding and verify your account first",
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = requireVerified;
