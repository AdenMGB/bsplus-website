-- Migration to add theme of the month tables

CREATE TABLE IF NOT EXISTS theme_of_the_month (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL UNIQUE,           -- 'YYYY-MM' (UTC)
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT,
  cover_image_uploaded_at INTEGER,
  theme_id TEXT,                         -- references themes.id (nullable; for store deep-link)
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_totm_month ON theme_of_the_month(month);
CREATE INDEX IF NOT EXISTS idx_totm_theme_id ON theme_of_the_month(theme_id);
