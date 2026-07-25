DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'requests'
      AND column_name = 'status_changed_at'
  ) THEN
    ALTER TABLE requests
      ADD COLUMN status_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

    UPDATE requests
    SET status_changed_at = created_at
    WHERE status IN ('completed', 'cancelled');
  END IF;
END
$$;
