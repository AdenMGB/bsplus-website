-- Migration 014: Track feedback reply emails and admin digest notifications

ALTER TABLE feedback_submissions ADD COLUMN response_emailed_at INTEGER;
ALTER TABLE feedback_submissions ADD COLUMN admin_notified_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_feedback_admin_notified
  ON feedback_submissions(admin_notified_at, created_at);
