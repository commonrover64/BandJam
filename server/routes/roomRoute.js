const {
  createRoom,
  removeRoom,
  editRoom,
  getAllRooms,
} = require("../controllers/roomController");
const router = require("express").Router();

router.post("/addroom", createRoom);
router.patch("/updateroom", editRoom);
router.delete("/deleteroom", removeRoom);
router.get("/getallrooms", getAllRooms);

module.exports = router;
