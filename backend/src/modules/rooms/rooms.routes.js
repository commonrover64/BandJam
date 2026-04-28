const express = require("express");
const router = express.Router();
const {
  create,
  getOne,
  update,
  remove,
  myRooms,
  search,
  toggleActive,
  getUploadSignature,
} = require("./rooms.controller");
const authenticate = require("../../middleware/authenticate");
const requireRole = require("../../middleware/requireRole");
const requireVerified = require("../../middleware/requireVerified");
const upload = require("../../config/upload");

router.get("/search", search);
router.get(
  "/upload-signature",
  authenticate,
  requireRole("owner"),
  getUploadSignature,
);

// public — anyone can view a room
router.get("/:id", getOne); // fetches one specific room by its UUID

// owner only
router.post("/", authenticate, requireRole("owner"), requireVerified, create);
router.patch("/:id", authenticate, requireRole("owner"), update);
router.delete("/:id", authenticate, requireRole("owner"), remove);
router.get("/owner/me", authenticate, requireRole("owner"), myRooms); // fetches all rooms belonging to the logged in owner
router.patch(
  "/:id/toggle-active",
  authenticate,
  requireRole("owner"),
  toggleActive,
);

module.exports = router;
