ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS tracking_token VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS request_tracking_token_unique_idx
  ON requests (tracking_token)
  WHERE tracking_token IS NOT NULL;
