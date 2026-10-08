const express = require("express");
const router = express.Router();
const {
  register,
  login,
  me,
  editProfile,
  editInstruments,
  editPhone,
  forgotPasswordHandler,
  resetPasswordHandler,
  savePushToken,
} = require("./auth.controller");
const authenticate = require("../../middleware/authenticate");
const rateLimit = require("../../middleware/rateLimit");

const MIN = 60 * 1000;
const byIpAndEmail = (req) => `${req.ip}|${String(req.body?.email ?? "").toLowerCase()}`;

const loginLimiter = rateLimit({ windowMs: 15 * MIN, max: 10, keyFn: byIpAndEmail, message: "Too many login attempts, try again in a few minutes" });
const registerLimiter = rateLimit({ windowMs: 60 * MIN, max: 10 });
const otpSendLimiter = rateLimit({ windowMs: 15 * MIN, max: 3, keyFn: byIpAndEmail, message: "Too many OTP requests, try again later" });
const otpVerifyLimiter = rateLimit({ windowMs: 15 * MIN, max: 10 });

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.get("/me", authenticate, me);
router.patch("/profile", authenticate, editProfile);
router.patch("/instruments", authenticate, editInstruments);
router.patch("/phone", authenticate, editPhone);
router.patch("/push-token", authenticate, savePushToken);

router.post("/forgot-password", otpSendLimiter, forgotPasswordHandler);
router.post("/reset-password", otpVerifyLimiter, resetPasswordHandler);

module.exports = router;
