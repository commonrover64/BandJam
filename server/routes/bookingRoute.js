const {
  getAllBookingsById,
  bookRoomById,
} = require("../controllers/bookingController");

const router = require("express").Router();

router.get("/allbooking/:roomId", getAllBookingsById);
router.post("/bookroom", bookRoomById);

module.exports = router;
