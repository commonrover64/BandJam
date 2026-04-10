const {
  initiatePayment,
  getPaymentByBookingId,
} = require("./payments.service");

const initiate = async (req, res) => {
  try {
    const payment = await initiatePayment(req.user.id, req.body);
    res.status(201).json({ success: true, payment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getByBooking = async (req, res) => {
  try {
    const payment = await getPaymentByBookingId(
      req.params.bookingId,
      req.user.id,
    );
    res.status(200).json({ success: true, payment });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

module.exports = { initiate, getByBooking };
