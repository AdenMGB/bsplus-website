CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  cover_image TEXT,
  published BOOLEAN DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  preview_token TEXT,
  preview_expires_at INTEGER
);

CREATE TABLE IF NOT EXISTS page_stats (
  path TEXT PRIMARY KEY,
  views INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hourly_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  extension_sessions INTEGER NOT NULL DEFAULT 0,
  desqta_sessions INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(timestamp)
);
