-- Migration to add theme marketplace tables

CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  version TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  author_id TEXT,
  license TEXT NOT NULL DEFAULT 'MIT',
  category TEXT,
  tags TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  featured INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  rating_average REAL DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  compatibility_min TEXT NOT NULL,
  compatibility_max TEXT,
  preview_thumbnail_url TEXT,
  preview_screenshots TEXT,
  zip_download_url TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  published_at INTEGER,
  file_size INTEGER,
  checksum TEXT
);

CREATE TABLE IF NOT EXISTS theme_files (
  id TEXT PRIMARY KEY,
  theme_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT,
  checksum TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  cover_image_url TEXT,
  featured INTEGER DEFAULT 0,
  theme_ids TEXT,
  created_by TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, theme_id),
  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS theme_ratings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(user_id, theme_id),
  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS theme_submissions (
  id TEXT PRIMARY KEY,
  theme_id TEXT,
  submitted_by TEXT,
  submission_notes TEXT,
  status TEXT NOT NULL,
  reviewed_by TEXT,
  reviewed_at INTEGER,
  rejection_reason TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_themes_status ON themes(status);
CREATE INDEX IF NOT EXISTS idx_themes_category ON themes(category);
CREATE INDEX IF NOT EXISTS idx_themes_featured ON themes(featured);
CREATE INDEX IF NOT EXISTS idx_themes_created ON themes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_themes_downloads ON themes(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_themes_rating ON themes(rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_themes_slug ON themes(slug);

CREATE INDEX IF NOT EXISTS idx_theme_files_theme ON theme_files(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_files_type ON theme_files(file_type);

CREATE INDEX IF NOT EXISTS idx_collections_featured ON collections(featured);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_theme ON user_favorites(theme_id);

CREATE INDEX IF NOT EXISTS idx_theme_ratings_theme ON theme_ratings(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_ratings_user ON theme_ratings(user_id);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON theme_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_theme ON theme_submissions(theme_id);
