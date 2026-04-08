CREATE TABLE IF NOT EXISTS bookings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id      UUID REFERENCES rooms(id) ON DELETE CASCADE,
  consumer_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  status       VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  total_amount NUMERIC(10, 2) NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE (room_id, booking_date)
);