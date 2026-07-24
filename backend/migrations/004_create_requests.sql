CREATE TABLE IF NOT EXISTS requests (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  table_id BIGINT NOT NULL REFERENCES restaurant_tables(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',
      'accepted',
      'preparing',
      'ready',
      'completed',
      'cancelled'
    ))
);

CREATE TABLE IF NOT EXISTS requested_items (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  qty INTEGER NOT NULL CHECK (qty > 0)
);

CREATE TABLE IF NOT EXISTS requested_items_ingredients (
  id BIGSERIAL PRIMARY KEY,
  requested_item_id BIGINT NOT NULL REFERENCES requested_items(id) ON DELETE CASCADE,
  ingredient_name VARCHAR(255) NOT NULL,
  option_name VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS request_user_created_at_idx
  ON requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS request_table_id_idx
  ON requests (table_id);
CREATE INDEX IF NOT EXISTS request_status_idx
  ON requests (user_id, status);
CREATE INDEX IF NOT EXISTS requested_items_request_id_idx
  ON requested_items (request_id);
CREATE INDEX IF NOT EXISTS requested_items_item_id_idx
  ON requested_items (item_id);
CREATE INDEX IF NOT EXISTS requested_items_ingredients_item_idx
  ON requested_items_ingredients (requested_item_id);
