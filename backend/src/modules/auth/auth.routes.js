const express = require("express");
const router = express.Router();
const { register, login, me } = require("./auth.controller");
const authenticate = require("../../middleware/authenticate");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me); // protected — needs valid token

module.exports = router;
