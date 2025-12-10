const roomModel = require("../models/roomSchema");

const createRoom = async (req, res) => {
  try {
    const newRoom = new roomModel(req?.body);
    await newRoom.save();

    res.status(201).json({
      success: true,
      message: "Room Registered Sucessfully",
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const removeRoom = async (req, res) => {
  try {
    const deleted = await roomModel.findByIdAndDelete(req?.body?.roomID);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found!!" });
    }

    res
      .status(200)
      .json({ success: true, message: "Room Deleted Sucessfully" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const editRoom = async (req, res) => {
  try {
    const update = await roomModel.findByIdAndUpdate(req?.body?.ID, req.body, {
      new: true,
    });

    res
      .status(200)
      .json({ success: true, message: "Room details updated sucessfully!" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const getAllRoomsbyID = async (req, res) => {
  try {
    const allRooms = await roomModel.find({owner:req?.body?.ID});
    res
      .status(200)
      .json({
        success: true,
        message: "All Rooms by id fetched sucessfully",
        data: allRooms,
      });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const allRooms = await roomModel.find();
    res
      .status(200)
      .json({
        success: true,
        message: "All Rooms fetched sucessfully",
        data: allRooms,
      });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

module.exports = { createRoom, removeRoom, editRoom, getAllRooms, getAllRoomsbyID };
