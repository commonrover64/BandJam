const {
  createBooking,
  getBookingById,
  getConsumerBookings,
  getOwnerBookings,
  cancelBooking,
  approveBooking,
  declineBooking,
  getRecentlyBookedRooms,
} = require("./bookings.service");
const { sendError } = require("../../utils/httpError");

const create = async (req, res) => {
  try {
    const booking = await createBooking(req.user.id, req.body);
    res.status(201).json({ success: true, booking });
  } catch (err) {
    sendError(res, err);
  }
};

const getOne = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id, req.user.id);
    res.status(200).json({ success: true, booking });
  } catch (err) {
    sendError(res, err, 404);
  }
};

const myBookings = async (req, res) => {
  try {
    const bookings = await getConsumerBookings(req.user.id);
    res.status(200).json({ success: true, bookings });
  } catch (err) {
    sendError(res, err, 500);
  }
};

const ownerBookings = async (req, res) => {
  try {
    const bookings = await getOwnerBookings(req.user.id);
    res.status(200).json({ success: true, bookings });
  } catch (err) {
    sendError(res, err, 500);
  }
};

const cancel = async (req, res) => {
  try {
    const booking = await cancelBooking(req.user.id, req.params.id);
    res.status(200).json({ success: true, booking });
  } catch (err) {
    sendError(res, err);
  }
};

const recentRooms = async (req, res) => {
  try {
    const rooms = await getRecentlyBookedRooms(req.user.id);
    res.status(200).json({ success: true, rooms });
  } catch (err) {
    sendError(res, err, 500);
  }
};

const approve = async (req, res) => {
  try {
    const result = await approveBooking(req.user.id, req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    sendError(res, err);
  }
};

const decline = async (req, res) => {
  try {
    const result = await declineBooking(req.user.id, req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = {
  create,
  getOne,
  myBookings,
  ownerBookings,
  cancel,
  recentRooms,
  approve,
  decline
};
