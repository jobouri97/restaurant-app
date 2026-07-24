CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  image_url TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  is_available BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ingredients (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS ingredient_options (
  id BIGSERIAL PRIMARY KEY,
  ingredient_id BIGINT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  option_name VARCHAR(255) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS items_category_id_idx ON items (category_id);
CREATE INDEX IF NOT EXISTS ingredients_item_id_idx ON ingredients (item_id);
CREATE INDEX IF NOT EXISTS ingredient_options_ingredient_id_idx
  ON ingredient_options (ingredient_id);

CREATE UNIQUE INDEX IF NOT EXISTS ingredient_options_name_unique_idx
  ON ingredient_options (ingredient_id, LOWER(option_name));

CREATE UNIQUE INDEX IF NOT EXISTS ingredient_options_one_default_idx
  ON ingredient_options (ingredient_id)
  WHERE is_default = TRUE;
