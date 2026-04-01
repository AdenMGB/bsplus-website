CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    client_id TEXT,
    refresh_token_hash TEXT NOT NULL,
    session_family_id TEXT,
    device_name TEXT,
    user_agent TEXT,
    created_ip TEXT,
    last_ip TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    last_used_at INTEGER,
    expires_at INTEGER NOT NULL,
    revoked_at INTEGER
);
