const pool = require("../../config/db");

const createBooking = async (consumerId, { room_id, booking_date }) => {
  // get room details to calculate total amount
  const { rows: roomRows } = await pool.query(
    "SELECT id, price_per_day, is_active FROM rooms WHERE id = $1",
    [room_id],
  );
  const room = roomRows[0];
  if (!room) throw new Error("Room not found");
  if (!room.is_active) throw new Error("Room is not available");

  // check if room is already booked on that date
  const { rows: conflict } = await pool.query(
    "SELECT id FROM bookings WHERE room_id = $1 AND booking_date = $2 AND status != 'cancelled'",
    [room_id, booking_date],
  );
  if (conflict.length > 0) throw new Error("Room already booked on this date");

  // total is just price per day for now (can extend to multiple days later)
  const total_amount = room.price_per_day;

  const { rows } = await pool.query(
    `INSERT INTO bookings (room_id, consumer_id, booking_date, total_amount)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [room_id, consumerId, booking_date, total_amount],
  );
  return rows[0];
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
    `SELECT b.*, r.name AS room_name, r.address, r.phone AS room_phone,
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
  // get all bookings for all rooms owned by this owner
  const { rows } = await pool.query(
    `SELECT b.*, r.name AS room_name, r.address
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
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
};
