-- Pseudo BetterSEQTA themes: theme.json is hosted externally (e.g. GitHub raw); not stored on R2.
-- Metadata, listing, and download counts still use the themes API as usual.

ALTER TABLE themes ADD COLUMN is_pseudo_theme INTEGER NOT NULL DEFAULT 0;
