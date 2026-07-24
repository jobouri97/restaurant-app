ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS tracking_token VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS requests_tracking_token_unique_idx
  ON requests (tracking_token)
  WHERE tracking_token IS NOT NULL;

ALTER TABLE requested_items
  DROP CONSTRAINT IF EXISTS requested_items_request_id_fkey;

ALTER TABLE requested_items
  ADD CONSTRAINT requested_items_request_id_fkey
  FOREIGN KEY (request_id)
  REFERENCES requests(id)
  ON DELETE CASCADE;
