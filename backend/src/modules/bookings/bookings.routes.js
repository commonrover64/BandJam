const express = require("express");
const router = express.Router();
const {
  create,
  getOne,
  myBookings,
  ownerBookings,
  cancel,
} = require("./bookings.controller");
const authenticate = require("../../middleware/authenticate");
const requireRole = require("../../middleware/requireRole");

router.post("/", authenticate, requireRole("consumer"), create);
router.get("/consumer/me", authenticate, requireRole("consumer"), myBookings);
router.get("/owner/me", authenticate, requireRole("owner"), ownerBookings);
router.get("/:id", authenticate, getOne);
router.patch("/:id/cancel", authenticate, requireRole("consumer"), cancel);

module.exports = router;
