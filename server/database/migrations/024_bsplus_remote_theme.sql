-- Migration 024: Remote theme packages + snapshot directive on global row

ALTER TABLE bsplus_remote_config_global
  ADD COLUMN remote_theme_json TEXT;

CREATE TABLE IF NOT EXISTS bsplus_remote_theme_packages (
  package_id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  theme_json TEXT,
  bundle_r2_key TEXT,
  sha256 TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_bsplus_remote_theme_packages_enabled
  ON bsplus_remote_theme_packages(enabled, updated_at DESC);
