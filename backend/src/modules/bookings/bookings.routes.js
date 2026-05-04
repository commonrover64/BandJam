const express = require("express");
const router = express.Router();
const {
  create,
  getOne,
  myBookings,
  ownerBookings,
  cancel,
  recentRooms,
  approve,
  decline
} = require("./bookings.controller");
const authenticate = require("../../middleware/authenticate");
const requireRole = require("../../middleware/requireRole");

router.post("/", authenticate, requireRole("consumer"), create);
router.get("/consumer/me", authenticate, requireRole("consumer"), myBookings);
router.get("/owner/me", authenticate, requireRole("owner"), ownerBookings);
router.get("/:id", authenticate, getOne);
router.patch("/:id/cancel", authenticate, requireRole("consumer"), cancel);
router.get(
  "/consumer/recent-rooms",
  authenticate,
  requireRole("consumer"),
  recentRooms,
);

router.patch("/:id/approve", authenticate, requireRole("owner"), approve);
router.patch("/:id/decline", authenticate, requireRole("owner"), decline);

module.exports = router;
