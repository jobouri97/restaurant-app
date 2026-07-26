ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_unique
  ON users (google_id)
  WHERE google_id IS NOT NULL;
