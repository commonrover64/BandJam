-- The original UNIQUE (room_id, booking_date) also counted cancelled/declined
-- bookings, so once any booking for a date was cancelled, nobody could ever
-- book that room on that date again (the insert failed with a raw
-- "duplicate key" error). Only active bookings should block a date.
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_room_id_booking_date_key;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_room_date_active_uniq
  ON bookings (room_id, booking_date)
  WHERE status <> 'cancelled';

CREATE INDEX IF NOT EXISTS idx_bookings_consumer ON bookings (consumer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_owner ON rooms (owner_id);
