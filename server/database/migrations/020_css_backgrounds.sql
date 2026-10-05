-- Random CSS theme backgrounds (served from /api/background.webp)

CREATE TABLE IF NOT EXISTS css_backgrounds (
  id TEXT PRIMARY KEY,
  r2_key TEXT NOT NULL UNIQUE,
  original_filename TEXT,
  width INTEGER,
  height INTEGER,
  byte_size INTEGER,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_by TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_css_backgrounds_enabled ON css_backgrounds (enabled);
