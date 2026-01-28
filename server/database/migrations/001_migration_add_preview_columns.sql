-- Migration to add preview_token and preview_expires_at columns to news table
ALTER TABLE news ADD COLUMN preview_token TEXT;
ALTER TABLE news ADD COLUMN preview_expires_at INTEGER;
