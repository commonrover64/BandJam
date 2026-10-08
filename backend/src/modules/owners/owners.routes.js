const express = require("express");
const router = express.Router();
const {
  sendOTPHandler,
  verifyOTPHandler,
  onboardHandler,
  statusHandler,
} = require("./owners.controller");
const authenticate = require("../../middleware/authenticate");
const requireRole = require("../../middleware/requireRole");
const rateLimit = require("../../middleware/rateLimit");

const otpSendLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3, keyFn: (req) => req.user.id, message: "Too many OTP requests, try again later" });
const otpVerifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, keyFn: (req) => req.user.id });

// all owner routes require login + owner role
router.use(authenticate, requireRole("owner"));

router.post("/send-otp", otpSendLimiter, sendOTPHandler);
router.post("/verify-otp", otpVerifyLimiter, verifyOTPHandler);
router.post("/onboard", onboardHandler);
router.get("/onboard/status", statusHandler);

module.exports = router;
