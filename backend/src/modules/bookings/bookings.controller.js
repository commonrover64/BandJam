const {
  createBooking,
  getBookingById,
  getConsumerBookings,
  getOwnerBookings,
  cancelBooking,
} = require("./bookings.service");

const create = async (req, res) => {
  try {
    const booking = await createBooking(req.user.id, req.body);
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id, req.user.id);
    res.status(200).json({ success: true, booking });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const myBookings = async (req, res) => {
  try {
    const bookings = await getConsumerBookings(req.user.id);
    res.status(200).json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const ownerBookings = async (req, res) => {
  try {
    const bookings = await getOwnerBookings(req.user.id);
    res.status(200).json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const cancel = async (req, res) => {
  try {
    const booking = await cancelBooking(req.user.id, req.params.id);
    res.status(200).json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const recentRooms = async (req, res) => {
  try {
    const rooms = await getRecentlyBookedRooms(req.user.id);
    res.status(200).json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  create,
  getOne,
  myBookings,
  ownerBookings,
  cancel,
  recentRooms,
};
