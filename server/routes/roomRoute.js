const {
  createRoom,
  removeRoom,
  editRoom,
  getAllRooms,
  getAllRoomsbyID,
} = require("../controllers/roomController");
const router = require("express").Router();

router.post("/addroom", createRoom);
router.patch("/updateroom", editRoom);
router.delete("/deleteroom", removeRoom);
router.get("/getallrooms", getAllRooms);
router.post("/getallroomsbyid", getAllRoomsbyID);

module.exports = router;
