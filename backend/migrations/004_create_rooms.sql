CREATE TABLE IF NOT EXISTS rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(150) NOT NULL,
  description   TEXT,
  address       TEXT NOT NULL,
  location      GEOGRAPHY(POINT, 4326) NOT NULL,
  phone         VARCHAR(20) NOT NULL,
  price_per_day NUMERIC(10, 2) NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rooms_location ON rooms USING GIST(location);