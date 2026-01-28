-- Migration to add daily questions tables

CREATE TABLE IF NOT EXISTS daily_questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  option1 TEXT NOT NULL,
  option2 TEXT NOT NULL,
  option3 TEXT,
  option4 TEXT,
  cover_image TEXT,
  cover_image_uploaded_at INTEGER,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS question_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  option_index INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(question_id, user_id),
  FOREIGN KEY (question_id) REFERENCES daily_questions(id)
);

CREATE TABLE IF NOT EXISTS question_results (
  question_id TEXT PRIMARY KEY,
  option1_count INTEGER DEFAULT 0,
  option2_count INTEGER DEFAULT 0,
  option3_count INTEGER DEFAULT 0,
  option4_count INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  last_updated INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (question_id) REFERENCES daily_questions(id)
);

CREATE INDEX IF NOT EXISTS idx_question_votes_question_id ON question_votes(question_id);
CREATE INDEX IF NOT EXISTS idx_question_votes_user_id ON question_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_questions_active ON daily_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_questions_expires_at ON daily_questions(expires_at);
