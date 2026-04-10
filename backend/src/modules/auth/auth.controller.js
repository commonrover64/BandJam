const {
  registerUser,
  loginUser,
  getUserById,
  updateProfile,
  updateInstruments,
  updatePhone,
} = require("./auth.service");

const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const data = await loginUser(req.body);
    res.status(200).json({ success: true, ...data });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

// req.user is attached by the authenticate middleware
const me = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const editProfile = async (req, res) => {
  try {
    const user = await updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const editInstruments = async (req, res) => {
  try {
    // req.body.instruments should be an array
    const user = await updateInstruments(req.user.id, req.body.instruments);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const editPhone = async (req, res) => {
  try {
    const user = await updatePhone(req.user.id, req.body.phone);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  me,
  editProfile,
  editInstruments,
  editPhone,
};
