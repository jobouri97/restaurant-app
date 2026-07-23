CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  image_url TEXT,
  CONSTRAINT categories_user_name_unique UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS categories_user_id_idx
  ON categories (user_id);
