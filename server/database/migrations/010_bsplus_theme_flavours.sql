-- BS Plus / BetterSEQTA theme flavours (master ↔ slave variants for store grid vs nested install ids)

ALTER TABLE themes ADD COLUMN flavour_master_id TEXT REFERENCES themes(id) ON DELETE CASCADE;
ALTER TABLE themes ADD COLUMN flavour_sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE themes ADD COLUMN default_colour TEXT;

CREATE INDEX IF NOT EXISTS idx_themes_flavour_master ON themes(flavour_master_id);
