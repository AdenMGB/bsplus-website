-- Migration 016: Milestone surveys, responses, and email campaign queue

CREATE TABLE IF NOT EXISTS surveys (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  eligibility_rule TEXT NOT NULL DEFAULT 'founding_2500',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  activated_at INTEGER
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  signup_number INTEGER,
  answers_json TEXT NOT NULL,
  completed_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(survey_id, user_id),
  FOREIGN KEY (survey_id) REFERENCES surveys(id)
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey
  ON survey_responses(survey_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_survey_responses_user
  ON survey_responses(user_id);

CREATE TABLE IF NOT EXISTS survey_email_queue (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  signup_number INTEGER,
  invite_token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  sent_at INTEGER,
  error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (survey_id) REFERENCES surveys(id)
);

CREATE INDEX IF NOT EXISTS idx_survey_email_pending
  ON survey_email_queue(survey_id, status);

CREATE INDEX IF NOT EXISTS idx_survey_email_user
  ON survey_email_queue(survey_id, user_id);

INSERT OR IGNORE INTO surveys (
  id,
  slug,
  title,
  description,
  status,
  eligibility_rule,
  created_at,
  activated_at
) VALUES (
  'survey-founding-2500',
  'founding-2500',
  'BetterSEQTA Cloud — 2,500 Users',
  'Celebration survey for our first 2,500 Cloud members.',
  'active',
  'founding_2500',
  unixepoch(),
  unixepoch()
);
