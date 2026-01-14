const bookingModel = require("../models/bookingSchema");

const getAllBookingsById = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).send({
        success: false,
        message: "roomId is required",
      });
    }
    const allBookings = await bookingModel.find({ room: roomId });

    res.status(200).send({
      success: true,
      message: "all bookings for this room fetched",
      data: allBookings,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const bookRoomById = async (req, res) => {
  try {
    const { user, room, date, amount, status } = req?.body;

    const checkDateAvailability = await bookingModel.findOne({
      room: room,
      date: date,
    });

    if (checkDateAvailability) {
      return res.status(400).send({
        success: false,
        message: "Cannot book on this date!",
      });
    }

    const newBooking = new bookingModel({
      user: user,
      room: room,
      date: date,
      amount: amount,
      status: status,
    });
    await newBooking.save();

    res.status(201).json({
      success: true,
      message: "Room Booked Sucessfully",
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

module.exports = { getAllBookingsById, bookRoomById };
