-- Per-recipient invite tokens: track email link clicks without a global HMAC secret

ALTER TABLE survey_email_queue ADD COLUMN clicked_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_survey_email_invite_token
  ON survey_email_queue(survey_id, invite_token);
