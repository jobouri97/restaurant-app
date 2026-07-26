-- Restaurant App schema for a new, empty Neon database.
-- Run once in the Neon Console SQL Editor.

BEGIN;

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  password_hash TEXT,
  google_id VARCHAR(255) UNIQUE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  public_code VARCHAR(16) NOT NULL UNIQUE,
  CONSTRAINT valid_auth_method
    CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL)
);

CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  image_url TEXT,
  CONSTRAINT categories_user_name_unique UNIQUE (user_id, name)
);

CREATE TABLE items (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  image_url TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT items_category_name_unique UNIQUE (category_id, name)
);

CREATE TABLE ingredients (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  CONSTRAINT ingredients_item_name_unique UNIQUE (item_id, name)
);

CREATE TABLE ingredient_options (
  id BIGSERIAL PRIMARY KEY,
  ingredient_id BIGINT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  option_name VARCHAR(255) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT ingredient_options_name_unique UNIQUE (ingredient_id, option_name)
);

CREATE TABLE restaurant_tables (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  number INTEGER NOT NULL CHECK (number > 0),
  qr_code TEXT NOT NULL UNIQUE,
  CONSTRAINT restaurant_tables_user_number_unique UNIQUE (user_id, number)
);

CREATE TABLE requests (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  table_id BIGINT NOT NULL REFERENCES restaurant_tables(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'
    )),
  tracking_token VARCHAR(64),
  status_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE requested_items (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  qty INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0)
);

CREATE TABLE requested_items_ingredients (
  id BIGSERIAL PRIMARY KEY,
  requested_item_id BIGINT NOT NULL REFERENCES requested_items(id) ON DELETE CASCADE,
  ingredient_name VARCHAR(255) NOT NULL,
  option_name VARCHAR(255) NOT NULL
);

CREATE TABLE profits (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id BIGINT NOT NULL REFERENCES requests(id) ON DELETE RESTRICT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profits_request_unique UNIQUE (request_id)
);

CREATE INDEX categories_user_id_idx ON categories (user_id);
CREATE INDEX items_category_id_idx ON items (category_id);
CREATE INDEX ingredients_item_id_idx ON ingredients (item_id);
CREATE INDEX ingredient_options_ingredient_id_idx ON ingredient_options (ingredient_id);

CREATE UNIQUE INDEX ingredient_options_case_insensitive_name_unique_idx
  ON ingredient_options (ingredient_id, LOWER(option_name));

CREATE UNIQUE INDEX ingredient_options_one_default_idx
  ON ingredient_options (ingredient_id)
  WHERE is_default = TRUE;

CREATE INDEX restaurant_tables_user_id_idx ON restaurant_tables (user_id);
CREATE INDEX requests_user_created_at_idx ON requests (user_id, created_at DESC);
CREATE INDEX requests_table_id_idx ON requests (table_id);
CREATE INDEX requests_user_status_idx ON requests (user_id, status);

CREATE UNIQUE INDEX requests_tracking_token_unique_idx
  ON requests (tracking_token)
  WHERE tracking_token IS NOT NULL;

CREATE INDEX requested_items_request_id_idx ON requested_items (request_id);
CREATE INDEX requested_items_item_id_idx ON requested_items (item_id);
CREATE INDEX requested_items_ingredients_item_idx
  ON requested_items_ingredients (requested_item_id);
CREATE INDEX profits_user_created_at_idx ON profits (user_id, created_at DESC);

COMMIT;
