-- Migration 022: BetterSEQTA+ remote config, campaigns, install registry

CREATE TABLE IF NOT EXISTS bsplus_remote_config_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  config_version TEXT NOT NULL,
  etag TEXT NOT NULL,
  published_at INTEGER NOT NULL,
  snapshot_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bsplus_remote_config_global (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  mode TEXT NOT NULL DEFAULT 'on' CHECK (mode IN ('on', 'off')),
  allow_local_override INTEGER NOT NULL DEFAULT 1,
  status_message TEXT,
  maintenance_json TEXT,
  min_extension_version TEXT,
  force_update_url TEXT,
  disable_cloud_sync INTEGER NOT NULL DEFAULT 0,
  disable_theme_store INTEGER NOT NULL DEFAULT 0,
  disable_feedback_submit INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS bsplus_remote_config_features (
  feature_key TEXT PRIMARY KEY,
  mode TEXT NOT NULL CHECK (
    mode IN ('allow', 'hide', 'banner', 'block', 'greyout', 'temp_hide')
  ),
  message_json TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS bsplus_remote_config_campaigns (
  id TEXT PRIMARY KEY,
  priority INTEGER NOT NULL DEFAULT 0,
  active_from TEXT NOT NULL,
  active_to TEXT NOT NULL,
  header_json TEXT NOT NULL,
  hero_json TEXT,
  body_html TEXT NOT NULL DEFAULT '',
  buttons_json TEXT NOT NULL DEFAULT '[]',
  require_acknowledge INTEGER NOT NULL DEFAULT 0,
  omit_body_from_snapshot INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_bsplus_remote_campaigns_priority
  ON bsplus_remote_config_campaigns(priority DESC, updated_at DESC);

CREATE TABLE IF NOT EXISTS bsplus_installs (
  install_id TEXT PRIMARY KEY,
  user_id TEXT,
  extension_version TEXT,
  channel TEXT,
  browser TEXT,
  hostname TEXT,
  first_seen_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_seen_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_bsplus_installs_last_seen
  ON bsplus_installs(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_bsplus_installs_user
  ON bsplus_installs(user_id);

CREATE TABLE IF NOT EXISTS bsplus_remote_config_rate (
  bucket_key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO bsplus_remote_config_global (id, mode, allow_local_override, updated_at)
VALUES (1, 'on', 1, unixepoch());

INSERT OR IGNORE INTO bsplus_remote_config_meta (
  id,
  config_version,
  etag,
  published_at,
  snapshot_json
)
VALUES (
  1,
  '1970-01-01T00:00:00.000Z',
  'W/"bootstrap"',
  0,
  '{"configVersion":"1970-01-01T00:00:00.000Z","etag":"W/\\"bootstrap\\"","source":"api","global":{"mode":"on","allowLocalOverride":true,"statusMessage":null,"maintenance":null,"minExtensionVersion":null,"forceUpdateUrl":null,"disableCloudSync":false,"disableThemeStore":false,"disableFeedbackSubmit":false},"features":{},"campaigns":[]}'
);
