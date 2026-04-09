const {
  createRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
  getOwnerRooms,
} = require("./rooms.service");

const create = async (req, res) => {
  try {
    const room = await createRoom(req.user.id, req.body);
    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const room = await getRoomById(req.params.id);
    res.status(200).json({ success: true, room });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const room = await updateRoom(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await deleteRoom(req.user.id, req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const myRooms = async (req, res) => {
  try {
    const rooms = await getOwnerRooms(req.user.id);
    res.status(200).json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { create, getOne, update, remove, myRooms };
