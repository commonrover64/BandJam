const { sendOTP, verifyOTP, completeOnboarding } = require("./owners.service");

const sendOTPHandler = async (req, res) => {
  try {
    const result = await sendOTP(req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const verifyOTPHandler = async (req, res) => {
  try {
    const result = await verifyOTP(req.user.id, req.body.otp);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const onboardHandler = async (req, res) => {
  try {
    const result = await completeOnboarding(req.user.id, req.body);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { sendOTPHandler, verifyOTPHandler, onboardHandler };
