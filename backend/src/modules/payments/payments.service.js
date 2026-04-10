const pool = require("../../config/db");

const initiatePayment = async (consumerId, { booking_id, payment_method }) => {
  // check booking exists and belongs to this consumer
  const { rows: bookingRows } = await pool.query(
    "SELECT * FROM bookings WHERE id = $1 AND consumer_id = $2",
    [booking_id, consumerId],
  );
  const booking = bookingRows[0];
  if (!booking) throw new Error("Booking not found or unauthorized");
  if (booking.status === "cancelled")
    throw new Error("Cannot pay for a cancelled booking");

  // check if payment already exists for this booking
  const { rows: existing } = await pool.query(
    "SELECT id, status FROM payments WHERE booking_id = $1",
    [booking_id],
  );
  if (existing.length > 0 && existing[0].status === "success") {
    throw new Error("Payment already completed for this booking");
  }

  // simulate payment — in real world this is where you call Razorpay/Stripe
  const paymentStatus = "success";
  const paidAt = new Date();

  // insert payment record
  const { rows } = await pool.query(
    `INSERT INTO payments (booking_id, consumer_id, amount, status, payment_method, paid_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (booking_id) DO UPDATE
       SET status = $4, payment_method = $5, paid_at = $6
     RETURNING *`,
    [
      booking_id,
      consumerId,
      booking.total_amount,
      paymentStatus,
      payment_method,
      paidAt,
    ],
  );

  // if payment success, update booking status to confirmed
  if (paymentStatus === "success") {
    await pool.query("UPDATE bookings SET status = 'confirmed' WHERE id = $1", [
      booking_id,
    ]);
  }

  return rows[0];
};

const getPaymentByBookingId = async (bookingId, userId) => {
  // check the booking belongs to this user (consumer or owner)
  const { rows: bookingRows } = await pool.query(
    `SELECT b.*, r.owner_id FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     WHERE b.id = $1`,
    [bookingId],
  );
  const booking = bookingRows[0];
  if (!booking) throw new Error("Booking not found");

  // only consumer or room owner can view payment
  if (booking.consumer_id !== userId && booking.owner_id !== userId) {
    throw new Error("Unauthorized");
  }

  const { rows } = await pool.query(
    "SELECT * FROM payments WHERE booking_id = $1",
    [bookingId],
  );
  if (!rows[0]) throw new Error("No payment found for this booking");
  return rows[0];
};

module.exports = { initiatePayment, getPaymentByBookingId };
