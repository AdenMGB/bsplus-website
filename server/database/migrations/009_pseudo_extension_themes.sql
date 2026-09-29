-- BetterSEQTA themes whose theme.json is hosted externally (not on R2)

ALTER TABLE themes ADD COLUMN is_pseudo_theme INTEGER NOT NULL DEFAULT 0;
