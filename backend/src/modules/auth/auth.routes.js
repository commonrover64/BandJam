const express = require("express");
const router = express.Router();
const {
  register,
  login,
  me,
  editProfile,
  editInstruments,
  editPhone,
} = require("./auth.controller");
const authenticate = require("../../middleware/authenticate");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me); // protected — needs valid token
router.patch("/profile", authenticate, editProfile);
router.patch("/instruments", authenticate, editInstruments);
router.patch("/phone", authenticate, editPhone);

module.exports = router;
