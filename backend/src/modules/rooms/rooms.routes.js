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

router.get("/search", search);
router.get(
  "/upload-signature",
  authenticate,
  requireRole("owner"),
  getUploadSignature,
);

// owner listing first so it can never be shadowed by "/:id"
router.get("/owner/me", authenticate, requireRole("owner"), myRooms);

// public — anyone can view a room
router.get("/:id", getOne);

// owner only
router.post("/", authenticate, requireRole("owner"), requireVerified, create);
router.patch("/:id", authenticate, requireRole("owner"), update);
router.delete("/:id", authenticate, requireRole("owner"), remove);
router.patch(
  "/:id/toggle-active",
  authenticate,
  requireRole("owner"),
  toggleActive,
);

module.exports = router;
