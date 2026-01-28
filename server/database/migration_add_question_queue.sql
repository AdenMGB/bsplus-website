-- Migration to add queue-based question system

-- Add duration field (in seconds) for queue-based questions
ALTER TABLE daily_questions ADD COLUMN duration INTEGER;

-- Add queue_order field to determine order of queued questions
ALTER TABLE daily_questions ADD COLUMN queue_order INTEGER DEFAULT 0;

-- Add auto_activate field to indicate if question should auto-activate
ALTER TABLE daily_questions ADD COLUMN auto_activate INTEGER DEFAULT 0;

-- Create index for queue ordering
CREATE INDEX IF NOT EXISTS idx_daily_questions_queue_order ON daily_questions(queue_order, auto_activate);
