-- OTPs: track failed attempts (brute-force protection) and what each code is
-- for, so a password-reset code and an owner-verification code can't be mixed.
ALTER TABLE otps ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 0;
ALTER TABLE otps ADD COLUMN IF NOT EXISTS purpose VARCHAR(30) NOT NULL DEFAULT 'verify_owner';
CREATE INDEX IF NOT EXISTS idx_otps_email_purpose ON otps (email, purpose);

-- Case-insensitive email lookups (Foo@x.com and foo@x.com are the same user)
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
