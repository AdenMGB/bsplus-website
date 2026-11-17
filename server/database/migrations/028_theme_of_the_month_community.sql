-- Theme of the month may link to official marketplace or approved community themes

ALTER TABLE theme_of_the_month ADD COLUMN theme_source TEXT NOT NULL DEFAULT 'marketplace'
  CHECK (theme_source IN ('marketplace', 'community'));

CREATE INDEX IF NOT EXISTS idx_totm_theme_source ON theme_of_the_month(theme_source);