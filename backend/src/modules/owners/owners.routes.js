const express = require("express");
const router = express.Router();
const {
  sendOTPHandler,
  verifyOTPHandler,
  onboardHandler,
} = require("./owners.controller");
const authenticate = require("../../middleware/authenticate");
const requireRole = require("../../middleware/requireRole");

// all owner routes require login + owner role
router.use(authenticate, requireRole("owner"));

router.post("/send-otp", sendOTPHandler);
router.post("/verify-otp", verifyOTPHandler);
router.post("/onboard", onboardHandler);

module.exports = router;
