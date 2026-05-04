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

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me); // protected — needs valid token
router.patch("/profile", authenticate, editProfile);
router.patch("/instruments", authenticate, editInstruments);
router.patch("/phone", authenticate, editPhone);
router.patch("/push-token", authenticate, savePushToken);

router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);

module.exports = router;
