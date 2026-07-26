-- Migration 013: Admin response fields for extension feedback triage

ALTER TABLE feedback_submissions ADD COLUMN admin_response TEXT;
ALTER TABLE feedback_submissions ADD COLUMN responded_at INTEGER;
ALTER TABLE feedback_submissions ADD COLUMN responded_by TEXT;
