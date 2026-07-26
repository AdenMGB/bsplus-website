-- Migration 012: BetterSEQTA+ extension feedback submissions
-- Anonymous install-correlated feedback with optional contact/instance opt-in.

CREATE TABLE IF NOT EXISTS feedback_submissions (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL,
  install_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('bug', 'feature', 'question', 'other')),
  subject TEXT,
  message TEXT NOT NULL,
  extension_version TEXT NOT NULL,
  browser TEXT NOT NULL CHECK (browser IN ('chrome', 'firefox', 'safari', 'edge', 'other')),
  browser_version TEXT,
  os TEXT NOT NULL,
  channel TEXT CHECK (channel IS NULL OR channel IN ('stable', 'dev', 'nightly', 'unknown')),
  contact_included INTEGER NOT NULL DEFAULT 0,
  contact_name TEXT,
  contact_email TEXT,
  instance_included INTEGER NOT NULL DEFAULT 0,
  instance_hostname TEXT,
  instance_product TEXT CHECK (
    instance_product IS NULL OR instance_product IN ('learn', 'engage', 'unknown')
  ),
  context_page TEXT,
  context_locale TEXT,
  context_dark_mode INTEGER,
  client_submitted_at INTEGER,
  status TEXT NOT NULL DEFAULT 'received' CHECK (
    status IN ('received', 'triaged', 'in_progress', 'resolved', 'wontfix', 'spam')
  ),
  internal_notes TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_feedback_install_created
  ON feedback_submissions(install_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_created
  ON feedback_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_status_created
  ON feedback_submissions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_category_created
  ON feedback_submissions(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_ip_hash_created
  ON feedback_submissions(ip_hash, created_at DESC);

CREATE TABLE IF NOT EXISTS feedback_installs (
  install_id TEXT PRIMARY KEY,
  first_seen_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_seen_at INTEGER NOT NULL DEFAULT (unixepoch()),
  submission_count INTEGER NOT NULL DEFAULT 0
);
