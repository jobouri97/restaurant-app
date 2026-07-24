CREATE TABLE IF NOT EXISTS restaurant_tables (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  number INTEGER NOT NULL CHECK (number > 0),
  qr_code TEXT NOT NULL UNIQUE,
  UNIQUE (user_id, number)
);

CREATE INDEX IF NOT EXISTS restaurant_tables_user_id_idx
  ON restaurant_tables(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS restaurant_tables_qr_code_unique_idx
  ON restaurant_tables(qr_code);
CREATE UNIQUE INDEX IF NOT EXISTS restaurant_tables_user_id_number_unique_idx
  ON restaurant_tables(user_id, number);
