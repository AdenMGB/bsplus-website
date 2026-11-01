-- Migration 026: Audience targeting, per-client overrides, theme analytics

ALTER TABLE bsplus_remote_config_campaigns ADD COLUMN targeting_json TEXT;
ALTER TABLE bsplus_remote_config_features ADD COLUMN targeting_json TEXT;
ALTER TABLE bsplus_remote_config_global ADD COLUMN remote_theme_targeting_json TEXT;

CREATE TABLE IF NOT EXISTS bsplus_remote_config_overrides (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('install', 'user')),
  scope_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (
    kind IN (
      'feature',
      'feature_allow',
      'campaign_force_include',
      'campaign_force_exclude',
      'global',
      'remote_theme'
    )
  ),
  target_key TEXT,
  value_json TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_bsplus_rc_overrides_scope
  ON bsplus_remote_config_overrides(scope, scope_id, enabled);

CREATE TABLE IF NOT EXISTS bsplus_theme_download_events (
  id TEXT PRIMARY KEY,
  occurred_at INTEGER NOT NULL,
  theme_id TEXT NOT NULL,
  theme_source TEXT NOT NULL CHECK (theme_source IN ('official', 'community')),
  install_id TEXT,
  user_id TEXT,
  query_user_id TEXT,
  extension_version TEXT,
  channel TEXT,
  auth_method TEXT NOT NULL CHECK (auth_method IN ('bearer', 'query_only', 'anonymous')),
  route TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bsplus_theme_dl_theme_time
  ON bsplus_theme_download_events(theme_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_bsplus_theme_dl_install_time
  ON bsplus_theme_download_events(install_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_bsplus_theme_dl_user_time
  ON bsplus_theme_download_events(user_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS bsplus_theme_catalog_events (
  id TEXT PRIMARY KEY,
  occurred_at INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('list', 'detail', 'search', 'totm')),
  theme_id TEXT,
  install_id TEXT,
  user_id TEXT,
  extension_version TEXT,
  channel TEXT,
  route TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bsplus_theme_cat_type_time
  ON bsplus_theme_catalog_events(event_type, occurred_at DESC);
