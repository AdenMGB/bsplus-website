-- Custom user-uploaded themes database (isolated from main bsplus-db)

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS custom_themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  version TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  author_id TEXT NOT NULL,
  license TEXT NOT NULL DEFAULT 'MIT',
  category TEXT,
  tags TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  theme_type TEXT NOT NULL CHECK(theme_type IN ('betterseqta', 'desqta')),
  download_count INTEGER DEFAULT 0,
  preview_thumbnail_url TEXT,
  preview_screenshots TEXT,
  zip_download_url TEXT,
  theme_json_url TEXT,
  cover_image_url TEXT,
  marquee_image_url TEXT,
  file_size INTEGER,
  checksum TEXT,
  compatibility_min TEXT,
  compatibility_max TEXT,
  submission_notes TEXT,
  rejection_reason TEXT,
  reviewed_by TEXT,
  reviewed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  published_at INTEGER
);

CREATE TABLE IF NOT EXISTS custom_theme_files (
  id TEXT PRIMARY KEY,
  theme_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT,
  checksum TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (theme_id) REFERENCES custom_themes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS custom_theme_upload_log (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  theme_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_custom_themes_status ON custom_themes(status);
CREATE INDEX IF NOT EXISTS idx_custom_themes_author ON custom_themes(author_id);
CREATE INDEX IF NOT EXISTS idx_custom_themes_slug ON custom_themes(slug);
CREATE INDEX IF NOT EXISTS idx_custom_themes_created ON custom_themes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_themes_type ON custom_themes(theme_type);

CREATE INDEX IF NOT EXISTS idx_custom_theme_files_theme ON custom_theme_files(theme_id);

CREATE INDEX IF NOT EXISTS idx_custom_theme_upload_log_author ON custom_theme_upload_log(author_id);
CREATE INDEX IF NOT EXISTS idx_custom_theme_upload_log_created ON custom_theme_upload_log(created_at DESC);
