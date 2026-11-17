-- Community theme versioning: group re-uploads by author + name, surface latest by default

ALTER TABLE custom_themes ADD COLUMN version_group_id TEXT;
ALTER TABLE custom_themes ADD COLUMN version_index INTEGER NOT NULL DEFAULT 1;
ALTER TABLE custom_themes ADD COLUMN is_current_version INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_custom_themes_version_group
  ON custom_themes(version_group_id);
CREATE INDEX IF NOT EXISTS idx_custom_themes_current_version
  ON custom_themes(is_current_version);

-- Initialise single-theme groups
UPDATE custom_themes
SET version_group_id = id
WHERE version_group_id IS NULL;

-- Backfill version chains (same author + normalized name)
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY author_id, lower(trim(name))
      ORDER BY created_at ASC, id ASC
    ) AS version_index,
    ROW_NUMBER() OVER (
      PARTITION BY author_id, lower(trim(name))
      ORDER BY created_at DESC, id DESC
    ) AS recency_rank,
    FIRST_VALUE(id) OVER (
      PARTITION BY author_id, lower(trim(name))
      ORDER BY created_at ASC, id ASC
    ) AS version_group_id
  FROM custom_themes
)
UPDATE custom_themes
SET
  version_group_id = (
    SELECT version_group_id FROM ranked WHERE ranked.id = custom_themes.id
  ),
  version_index = (
    SELECT version_index FROM ranked WHERE ranked.id = custom_themes.id
  ),
  is_current_version = CASE
    WHEN (SELECT recency_rank FROM ranked WHERE ranked.id = custom_themes.id) = 1 THEN 1
    ELSE 0
  END;