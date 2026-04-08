CREATE TABLE IF NOT EXISTS owner_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  residential_addr  TEXT NOT NULL,
  id_document_url   TEXT NOT NULL,
  payment_details   TEXT NOT NULL,
  is_verified       BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP DEFAULT NOW()
);