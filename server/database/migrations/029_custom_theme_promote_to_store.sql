-- Track community themes imported into the official marketplace theme store

ALTER TABLE custom_themes ADD COLUMN promoted_marketplace_theme_id TEXT;
ALTER TABLE themes ADD COLUMN imported_from_custom_theme_id TEXT;

CREATE INDEX IF NOT EXISTS idx_custom_themes_promoted_store
  ON custom_themes(promoted_marketplace_theme_id);
CREATE INDEX IF NOT EXISTS idx_themes_imported_from_custom
  ON themes(imported_from_custom_theme_id);