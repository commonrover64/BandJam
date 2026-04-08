CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  consumer_id    UUID REFERENCES users(id),
  amount         NUMERIC(10, 2) NOT NULL,
  status         VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  payment_method VARCHAR(50),
  paid_at        TIMESTAMP,
  created_at     TIMESTAMP DEFAULT NOW()
);