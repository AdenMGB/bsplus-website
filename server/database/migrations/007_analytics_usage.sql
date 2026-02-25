-- Migration 007: App usage analytics (DesQTA / BetterSEQTA Cloud)
-- Stores daily usage reports from DesQTA app for aggregation and dashboards.
-- Supports both anonymous (client_id only) and authenticated (user_id) submissions.

CREATE TABLE IF NOT EXISTS app_usage_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  sessions_count INTEGER NOT NULL DEFAULT 0,
  cloud_signed_in INTEGER NOT NULL DEFAULT 0,
  app_version TEXT,
  platform TEXT,
  client_id TEXT,
  user_id TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_app_usage_date ON app_usage_analytics(date);
CREATE INDEX IF NOT EXISTS idx_app_usage_client_id ON app_usage_analytics(client_id);
CREATE INDEX IF NOT EXISTS idx_app_usage_user_id ON app_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_app_usage_platform ON app_usage_analytics(platform);
