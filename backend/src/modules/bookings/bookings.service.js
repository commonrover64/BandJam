const pool = require("../../config/db");
const { notify } = require("../../config/notifications");
const { HttpError } = require("../../utils/httpError");

// "Today" for booking rules is evaluated in the business timezone, not the
// server's (cloud hosts usually run in UTC, which is 5:30h behind IST).
const APP_TZ = process.env.APP_TZ || "Asia/Kolkata";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAYS_AHEAD = 365;

const createBooking = async (consumerId, { room_id, booking_date }) => {
  if (!room_id) throw new HttpError(400, "room_id is required");
  if (!DATE_RE.test(String(booking_date ?? "")))
    throw new HttpError(400, "booking_date must be YYYY-MM-DD");

  // validate the date in SQL so "today" uses APP_TZ
  const { rows: dateRows } = await pool.query(
    `SELECT
       $1::date < (now() AT TIME ZONE $2)::date AS in_past,
       $1::date > (now() AT TIME ZONE $2)::date + $3::int AS too_far`,
    [booking_date, APP_TZ, MAX_DAYS_AHEAD],
  );
  if (dateRows[0].in_past) throw new HttpError(400, "Cannot book a date in the past");
  if (dateRows[0].too_far) throw new HttpError(400, "That date is too far in the future");

  const { rows: roomRows } = await pool.query(
    `SELECT r.id, r.owner_id, r.price_per_day, r.is_active, r.name,
            u.push_token AS owner_push_token
     FROM rooms r
     JOIN users u ON r.owner_id = u.id
     WHERE r.id = $1`,
    [room_id],
  );
  const room = roomRows[0];
  if (!room) throw new HttpError(404, "Room not found");
  if (!room.is_active) throw new HttpError(400, "Room is not available");
  if (room.owner_id === consumerId) throw new HttpError(400, "You can't book your own room");

  let booking;
  try {
    // the partial unique index (migration 011) makes this race-free: two
    // simultaneous requests for the same date can't both succeed
    const { rows } = await pool.query(
      `INSERT INTO bookings (room_id, consumer_id, booking_date, total_amount, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [room_id, consumerId, booking_date, room.price_per_day],
    );
    booking = rows[0];
  } catch (err) {
    if (err.code === "23505") throw new HttpError(409, "Room already booked on this date");
    throw err;
  }

  const { rows: consumerRows } = await pool.query("SELECT name FROM users WHERE id = $1", [
    consumerId,
  ]);
  const consumerName = consumerRows[0]?.name || "Someone";

  // fire-and-forget: a push failure used to throw *after* the booking was
  // saved, so the user saw an error, retried, and got "already booked"
  notify(
    room.owner_push_token,
    "New Booking Request",
    `${consumerName} wants to book ${room.name} on ${booking_date}`,
    { type: "booking_request", booking_id: booking.id },
  );

  return booking;
};

// Atomic status transition: the WHERE status = 'pending' guard means an
// approve and a decline (or a consumer cancel) racing each other can't both win.
const transitionAsOwner = async (ownerId, bookingId, newStatus) => {
  const { rows } = await pool.query(
    `UPDATE bookings b
     SET status = $3
     FROM rooms r, users u
     WHERE b.id = $1
       AND b.room_id = r.id
       AND r.owner_id = $2
       AND b.consumer_id = u.id
       AND b.status = 'pending'
     RETURNING b.id, r.name AS room_name, b.booking_date, u.push_token AS consumer_push_token`,
    [bookingId, ownerId, newStatus],
  );
  if (rows[0]) return rows[0];

  // work out *why* it failed for a useful message
  const { rows: check } = await pool.query(
    `SELECT b.status, r.owner_id FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.id = $1`,
    [bookingId],
  );
  if (!check[0]) throw new HttpError(404, "Booking not found");
  if (check[0].owner_id !== ownerId) throw new HttpError(403, "Unauthorized");
  throw new HttpError(409, "Booking is no longer pending");
};

const approveBooking = async (ownerId, bookingId) => {
  const b = await transitionAsOwner(ownerId, bookingId, "confirmed");
  notify(
    b.consumer_push_token,
    "Booking Approved",
    `Your booking for ${b.room_name} on ${b.booking_date} has been confirmed. Pay at venue.`,
    { type: "booking_approved", booking_id: b.id },
  );
  return { message: "Booking approved" };
};

const declineBooking = async (ownerId, bookingId) => {
  const b = await transitionAsOwner(ownerId, bookingId, "cancelled");
  notify(
    b.consumer_push_token,
    "Booking Declined",
    `Your booking request for ${b.room_name} was declined by the owner.`,
    { type: "booking_declined", booking_id: b.id },
  );
  return { message: "Booking declined" };
};

const getBookingById = async (id, userId) => {
  const { rows } = await pool.query(
    `SELECT b.*, r.name AS room_name, r.address, r.phone, r.owner_id
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     WHERE b.id = $1`,
    [id],
  );
  const booking = rows[0];
  if (!booking) throw new HttpError(404, "Booking not found");
  if (booking.consumer_id !== userId && booking.owner_id !== userId)
    throw new HttpError(404, "Booking not found");
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
     ORDER BY b.created_at DESC
     LIMIT 500`,
    [consumerId],
  );
  return rows;
};

const getOwnerBookings = async (ownerId) => {
  const { rows } = await pool.query(
    `SELECT b.*, r.name AS room_name, r.address,
            u.name AS consumer_name, u.phone AS consumer_phone,
            u.phone AS phone -- DashboardScreen reads b.phone
     FROM bookings b
     JOIN rooms r ON b.room_id = r.id
     JOIN users u ON b.consumer_id = u.id
     WHERE r.owner_id = $1
     ORDER BY b.created_at DESC
     LIMIT 500`,
    [ownerId],
  );
  return rows;
};

const cancelBooking = async (userId, bookingId) => {
  const { rows } = await pool.query(
    `UPDATE bookings b
     SET status = 'cancelled'
     FROM rooms r, users o
     WHERE b.id = $1
       AND b.consumer_id = $2
       AND b.room_id = r.id
       AND r.owner_id = o.id
       AND b.status <> 'cancelled'
       AND b.booking_date >= (now() AT TIME ZONE $3)::date
     RETURNING b.*, r.name AS room_name, o.push_token AS owner_push_token`,
    [bookingId, userId, APP_TZ],
  );
  if (!rows[0]) {
    const { rows: check } = await pool.query(
      "SELECT status FROM bookings WHERE id = $1 AND consumer_id = $2",
      [bookingId, userId],
    );
    if (!check[0]) throw new HttpError(404, "Booking not found");
    if (check[0].status === "cancelled") throw new HttpError(409, "Booking already cancelled");
    throw new HttpError(400, "Past bookings can't be cancelled");
  }

  const { owner_push_token, room_name, ...booking } = rows[0];
  // owners were never told when a consumer cancelled
  notify(
    owner_push_token,
    "Booking Cancelled",
    `A booking for ${room_name} on ${booking.booking_date} was cancelled.`,
    { type: "booking_cancelled", booking_id: booking.id },
  );
  return booking;
};

// Previously DISTINCT ON (r.id) ... ORDER BY r.id meant the "5 most recent"
// were really the 5 with the smallest UUIDs.
const getRecentlyBookedRooms = async (consumerId) => {
  const { rows } = await pool.query(
    `SELECT * FROM (
       SELECT DISTINCT ON (r.id)
         r.id, r.name, r.address, r.phone, r.price_per_day, r.image_url,
         ST_Y(r.location::geometry) AS lat,
         ST_X(r.location::geometry) AS lng,
         b.booking_date, b.status, b.created_at AS last_booked_at
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.consumer_id = $1 AND r.is_active = TRUE
       ORDER BY r.id, b.created_at DESC
     ) recent
     ORDER BY last_booked_at DESC
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
