const { sendOTP, verifyOTP, completeOnboarding, getOnboardingStatus } = require("./owners.service");
const { sendError } = require("../../utils/httpError");

const sendOTPHandler = async (req, res) => {
  try {
    const result = await sendOTP(req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    sendError(res, err);
  }
};

const verifyOTPHandler = async (req, res) => {
  try {
    const result = await verifyOTP(req.user.id, req.body.otp);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    sendError(res, err);
  }
};

const onboardHandler = async (req, res) => {
  try {
    const result = await completeOnboarding(req.user.id, req.body);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    sendError(res, err);
  }
};

const statusHandler = async (req, res) => {
  try {
    const status = await getOnboardingStatus(req.user.id);
    res.status(200).json({ success: true, ...status });
  } catch (err) {
    sendError(res, err, 500);
  }
};

module.exports = {
  sendOTPHandler,
  verifyOTPHandler,
  onboardHandler,
  statusHandler,
};
