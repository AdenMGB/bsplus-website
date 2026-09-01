-- Migration 015: Service API keys for interop routes (mail worker, accounts, etc.)

CREATE TABLE IF NOT EXISTS service_api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  scopes TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_used_at INTEGER,
  revoked_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_service_api_keys_hash
  ON service_api_keys(token_hash);
