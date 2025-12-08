const express = require("express");
const { registerUser, loginUser, currentUser } = require("../controllers/userController");
const { validateJWTToken } = require("../middlewares/authorizationMiddleWare");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// validate user logged in or not
router.get("/currentUser", validateJWTToken, currentUser)

module.exports = router;
