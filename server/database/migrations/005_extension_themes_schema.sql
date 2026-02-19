-- Migration: Add BetterSEQTA extension theme support
-- Adds theme_type, theme_json_url, cover_image_url, marquee_image_url
-- Makes zip_download_url and compatibility_min nullable for betterseqta themes

PRAGMA foreign_keys=OFF;

-- SQLite doesn't support ALTER COLUMN; recreate table with new schema
CREATE TABLE themes_new (
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
  compatibility_min TEXT,
  compatibility_max TEXT,
  preview_thumbnail_url TEXT,
  preview_screenshots TEXT,
  zip_download_url TEXT,
  theme_type TEXT NOT NULL DEFAULT 'desqta',
  theme_json_url TEXT,
  cover_image_url TEXT,
  marquee_image_url TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  published_at INTEGER,
  file_size INTEGER,
  checksum TEXT
);

-- Copy existing data (themes table from 004 has zip_download_url NOT NULL, compatibility_min NOT NULL)
INSERT INTO themes_new (
  id, name, slug, version, description, author, author_id, license, category, tags,
  status, featured, download_count, favorite_count, rating_average, rating_count,
  compatibility_min, compatibility_max, preview_thumbnail_url, preview_screenshots,
  zip_download_url, theme_type, theme_json_url, cover_image_url, marquee_image_url,
  created_at, updated_at, published_at, file_size, checksum
)
SELECT 
  id, name, slug, version, description, author, author_id, license, category, tags,
  status, featured, download_count, favorite_count, rating_average, rating_count,
  compatibility_min, compatibility_max, preview_thumbnail_url, preview_screenshots,
  zip_download_url,
  'desqta',
  NULL,
  NULL,
  NULL,
  created_at, updated_at, published_at, file_size, checksum
FROM themes;

DROP TABLE themes;
ALTER TABLE themes_new RENAME TO themes;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_themes_status ON themes(status);
CREATE INDEX IF NOT EXISTS idx_themes_category ON themes(category);
CREATE INDEX IF NOT EXISTS idx_themes_featured ON themes(featured);
CREATE INDEX IF NOT EXISTS idx_themes_created ON themes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_themes_downloads ON themes(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_themes_rating ON themes(rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_themes_slug ON themes(slug);
CREATE INDEX IF NOT EXISTS idx_themes_type ON themes(theme_type);

PRAGMA foreign_keys=ON;
