-- Track when submitters were emailed about community theme approval

ALTER TABLE custom_themes ADD COLUMN approval_emailed_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_custom_themes_approval_emailed
  ON custom_themes(approval_emailed_at);