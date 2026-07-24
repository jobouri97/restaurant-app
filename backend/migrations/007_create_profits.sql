CREATE TABLE IF NOT EXISTS profits (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id BIGINT NOT NULL REFERENCES requests(id) ON DELETE RESTRICT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profits_request_id_unique UNIQUE (request_id)
);

CREATE INDEX IF NOT EXISTS profits_user_created_at_idx
  ON profits (user_id, created_at DESC);

INSERT INTO profits (user_id, request_id, price, created_at)
SELECT user_id, id, price, NOW()
FROM requests
WHERE status = 'completed'
ON CONFLICT (request_id) DO NOTHING;
