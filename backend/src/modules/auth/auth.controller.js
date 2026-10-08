const pool = require("../../config/db");
const { sendError } = require("../../utils/httpError");
const {
  registerUser,
  loginUser,
  getUserById,
  updateProfile,
  updateInstruments,
  updatePhone,
  forgotPassword,
  resetPassword,
} = require("./auth.service");

const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ success: true, user });
  } catch (err) {
    sendError(res, err);
  }
};

const login = async (req, res) => {
  try {
    const data = await loginUser(req.body);
    res.status(200).json({ success: true, ...data });
  } catch (err) {
    sendError(res, err, 401);
  }
};

const me = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    sendError(res, err, 500);
  }
};

const editProfile = async (req, res) => {
  try {
    const user = await updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, user });
  } catch (err) {
    sendError(res, err);
  }
};

const editInstruments = async (req, res) => {
  try {
    const user = await updateInstruments(req.user.id, req.body.instruments);
    res.status(200).json({ success: true, user });
  } catch (err) {
    sendError(res, err);
  }
};

const editPhone = async (req, res) => {
  try {
    const user = await updatePhone(req.user.id, req.body.phone);
    res.status(200).json({ success: true, user });
  } catch (err) {
    sendError(res, err);
  }
};

const forgotPasswordHandler = async (req, res) => {
  try {
    const result = await forgotPassword(req.body.email);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    sendError(res, err);
  }
};

const resetPasswordHandler = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await resetPassword(email, otp, newPassword);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    sendError(res, err);
  }
};

const savePushToken = async (req, res) => {
  try {
    const token = req.body.push_token;
    if (token != null && !/^Expo(nent)?PushToken\[.+\]$/.test(token)) {
      return res.status(400).json({ success: false, message: "Invalid push token" });
    }
    // a device should only belong to one account: clear it from anyone else
    // (otherwise after switching accounts on a phone, both get notifications)
    if (token) {
      await pool.query("UPDATE users SET push_token = NULL WHERE push_token = $1 AND id <> $2", [
        token,
        req.user.id,
      ]);
    }
    await pool.query("UPDATE users SET push_token = $1 WHERE id = $2", [token ?? null, req.user.id]);
    res.status(200).json({ success: true });
  } catch (err) {
    sendError(res, err, 500);
  }
};

module.exports = {
  register,
  login,
  me,
  editProfile,
  editInstruments,
  editPhone,
  forgotPasswordHandler,
  resetPasswordHandler,
  savePushToken,
};
