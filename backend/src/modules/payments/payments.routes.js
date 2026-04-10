const express = require("express");
const router = express.Router();
const { initiate, getByBooking } = require("./payments.controller");
const authenticate = require("../../middleware/authenticate");
const requireRole = require("../../middleware/requireRole");

// only consumer can initiate payment
router.post("/", authenticate, requireRole("consumer"), initiate);

// both consumer and owner can view payment status
router.get("/:bookingId", authenticate, getByBooking);

module.exports = router;
