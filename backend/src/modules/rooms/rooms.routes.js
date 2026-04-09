const express = require("express");
const router = express.Router();
const {
  create,
  getOne,
  update,
  remove,
  myRooms,
} = require("./rooms.controller");
const authenticate = require("../../middleware/authenticate");
const requireRole = require("../../middleware/requireRole");

// public — anyone can view a room
router.get("/:id", getOne); // fetches one specific room by its UUID

// owner only
router.post("/", authenticate, requireRole("owner"), create);
router.patch("/:id", authenticate, requireRole("owner"), update);
router.delete("/:id", authenticate, requireRole("owner"), remove);
router.get("/owner/me", authenticate, requireRole("owner"), myRooms); // fetches all rooms belonging to the logged in owner

module.exports = router;
