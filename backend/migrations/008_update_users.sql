ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS instruments TEXT[] DEFAULT '{}';
-- TEXT[] is a postgres array — perfect for multi select instruments