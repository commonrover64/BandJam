const pool = require("../../config/db");
const { sendPushNotification } = require("../../config/notifications");

const createBooking = async (consumerId, { room_id, booking_date }) => {
  const { rows: roomRows } = await pool.query(
    `SELECT r.id, r.price_per_day, r.is_active, r.name,
            u.push_token AS owner_push_token, u.name AS owner_name
     FROM rooms r
     JOIN users u ON r.owner_id = u.id
     WHERE r.id = $1`,
    [room_id],
  );
  const room = roomRows[0];
  if (!room) throw new Error("Room not found");
  if (!room.is_active) throw new Error("Room is not available");

  const { rows: conflict } = await pool.query(
    "SELECT id FROM bookings WHERE room_id = $1 AND booking_date = $2 AND status != 'cancelled'",
    [room_id, booking_date],
  );
  if (conflict.length > 0) throw new Error("Room already booked on this date");

  const total_amount = room.price_per_day;

  const { rows } = await pool.query(
    `INSERT INTO bookings (room_id, consumer_id, booking_date, total_amount, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [room_id, consumerId, booking_date, total_amount],
  );
  const booking = rows[0];

  // get consumer name to show in notification
  const { rows: consumerRows } = await pool.query(
    "SELECT name FROM users WHERE id = $1",
    [consumerId],
  );
  const consumerName = consumerRows[0]?.name;

  // notify owner about new booking request
  await sendPushNotification(
    room.owner_push_token,
    "New Booking Request",
    `${consumerName} wants to book ${room.name} on ${booking_date}`,
    {
      type: "booking_request",
      booking_id: booking.id,
      screen: "BookingRequests",
    },
  );

  return booking;
};

const approveBooking = async (ownerId, bookingId) => {
  // verify this booking is for owner's room
  const { rows } = await pool.query(
    `SELECT b.*, r.owner_id, r.name AS room_name,
            u.push_token AS consumer_push_token
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     JOIN users u ON b.consumer_id = u.id
     WHERE b.id = $1`,
    [bookingId],
  );
  const booking = rows[0];
  if (!booking) throw new Error("Booking not found");
  if (booking.owner_id !== ownerId) throw new Error("Unauthorized");
  if (booking.status !== "pending") throw new Error("Booking is not pending");

  await pool.query("UPDATE bookings SET status = 'confirmed' WHERE id = $1", [
    bookingId,
  ]);

  // notify consumer
  await sendPushNotification(
    booking.consumer_push_token,
    "Booking Approved",
    `Your booking for ${booking.room_name} has been confirmed. Pay at venue.`,
    { type: "booking_approved", booking_id: bookingId },
  );

  return { message: "Booking approved" };
};

const declineBooking = async (ownerId, bookingId) => {
  const { rows } = await pool.query(
    `SELECT b.*, r.owner_id, r.name AS room_name,
            u.push_token AS consumer_push_token
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     JOIN users u ON b.consumer_id = u.id
     WHERE b.id = $1`,
    [bookingId],
  );
  const booking = rows[0];
  if (!booking) throw new Error("Booking not found");
  if (booking.owner_id !== ownerId) throw new Error("Unauthorized");
  if (booking.status !== "pending") throw new Error("Booking is not pending");

  await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [
    bookingId,
  ]);

  // notify consumer
  await sendPushNotification(
    booking.consumer_push_token,
    "Booking Declined",
    `Your booking request for ${booking.room_name} was declined by the owner.`,
    { type: "booking_declined", booking_id: bookingId },
  );

  return { message: "Booking declined" };
};

const getBookingById = async (id, userId) => {
  const { rows } = await pool.query(
    `SELECT b.*, r.name AS room_name, r.address, r.phone
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     WHERE b.id = $1`,
    [id],
  );
  const booking = rows[0];
  if (!booking) throw new Error("Booking not found");

  // only the consumer or the room owner can view the booking
  if (booking.consumer_id !== userId) {
    const { rows: ownerRows } = await pool.query(
      "SELECT owner_id FROM rooms WHERE id = $1",
      [booking.room_id],
    );
    if (ownerRows[0].owner_id !== userId) throw new Error("Unauthorized");
  }

  return booking;
};

const getConsumerBookings = async (consumerId) => {
  const { rows } = await pool.query(
    `SELECT b.*, 
            r.name AS room_name, r.address, r.phone AS room_phone,
            u.name AS owner_name,
            ST_Y(r.location::geometry) AS lat,
            ST_X(r.location::geometry) AS lng
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     JOIN users u ON r.owner_id = u.id
     WHERE b.consumer_id = $1
     ORDER BY b.created_at DESC`,
    [consumerId],
  );
  return rows;
};

const getOwnerBookings = async (ownerId) => {
  const { rows } = await pool.query(
    `SELECT b.*, r.name AS room_name, r.address,
            u.name AS consumer_name, u.phone AS consumer_phone
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     JOIN users u ON b.consumer_id = u.id
     WHERE r.owner_id = $1
     ORDER BY b.created_at DESC`,
    [ownerId],
  );
  return rows;
};

const cancelBooking = async (userId, bookingId) => {
  // only the consumer who made the booking can cancel it
  const { rows } = await pool.query(
    "SELECT * FROM bookings WHERE id = $1 AND consumer_id = $2",
    [bookingId, userId],
  );
  const booking = rows[0];
  if (!booking) throw new Error("Booking not found or unauthorized");
  if (booking.status === "cancelled")
    throw new Error("Booking already cancelled");

  const { rows: updated } = await pool.query(
    `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
    [bookingId],
  );
  return updated[0];
};

const getRecentlyBookedRooms = async (consumerId) => {
  // get last 5 distinct rooms this consumer booked
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (r.id)
      r.id, r.name, r.address, r.phone, r.price_per_day, r.image_url,
      ST_Y(r.location::geometry) AS lat,
      ST_X(r.location::geometry) AS lng,
      b.booking_date, b.status
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     WHERE b.consumer_id = $1
     ORDER BY r.id, b.created_at DESC
     LIMIT 5`,
    [consumerId],
  );
  return rows;
};

module.exports = {
  createBooking,
  getBookingById,
  getConsumerBookings,
  getOwnerBookings,
  cancelBooking,
  getRecentlyBookedRooms,
  approveBooking,
  declineBooking,
};
