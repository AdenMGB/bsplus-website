-- Inbound API keys from other BetterSEQTA services (admin UI)

CREATE TABLE IF NOT EXISTS site_integration_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  accounts_api_key TEXT,
  mail_api_key TEXT,
  mail_from_address TEXT,
  updated_at INTEGER,
  updated_by TEXT
);

INSERT OR IGNORE INTO site_integration_settings (id) VALUES (1);
