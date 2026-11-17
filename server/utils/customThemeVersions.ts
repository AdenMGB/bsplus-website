export function normalizeCustomThemeName(name: string): string {
  return name.trim().toLowerCase();
}

export interface CustomThemeVersionPlan {
  versionGroupId: string;
  versionIndex: number;
  canonicalSlug: string;
  isDuplicateUpload: boolean;
  priorVersionCount: number;
}

function versionedSlugArchive(slug: string, versionIndex: number): string {
  const base = slug.replace(/-v\d+$/i, '');
  return `${base}-v${versionIndex}`;
}

export async function planCustomThemeVersionUpload(
  db: {
    prepare: (sql: string) => {
      bind: (...args: unknown[]) => {
        first: <T>() => Promise<T | null>;
        all: <T>() => Promise<{ results?: T[] }>;
        run: () => Promise<unknown>;
      };
    };
  },
  params: {
    authorId: string;
    themeName: string;
    preferredSlug: string;
    newThemeId: string;
  }
): Promise<CustomThemeVersionPlan> {
  const { authorId, themeName, preferredSlug, newThemeId } = params;
  const normName = normalizeCustomThemeName(themeName);

  const siblings = await db
    .prepare(
      `SELECT id, slug, version_group_id, version_index, is_current_version, created_at
       FROM custom_themes
       WHERE author_id = ? AND lower(trim(name)) = ?
       ORDER BY created_at ASC, id ASC`
    )
    .bind(authorId, normName)
    .all<{
      id: string;
      slug: string;
      version_group_id: string | null;
      version_index: number;
      is_current_version: number;
      created_at: number;
    }>();

  const rows = siblings.results ?? [];
  if (rows.length === 0) {
    return {
      versionGroupId: newThemeId,
      versionIndex: 1,
      canonicalSlug: preferredSlug,
      isDuplicateUpload: false,
      priorVersionCount: 0
    };
  }

  const versionGroupId = rows[0].version_group_id?.trim() || rows[0].id;
  const maxIndex = rows.reduce((max, row) => Math.max(max, row.version_index ?? 1), 1);

  return {
    versionGroupId,
    versionIndex: maxIndex + 1,
    canonicalSlug: preferredSlug,
    isDuplicateUpload: true,
    priorVersionCount: rows.length
  };
}

export async function applyCustomThemeVersionSupersede(
  db: {
    prepare: (sql: string) => {
      bind: (...args: unknown[]) => {
        first: <T>() => Promise<T | null>;
        all: <T>() => Promise<{ results?: T[] }>;
        run: () => Promise<unknown>;
      };
    };
  },
  plan: CustomThemeVersionPlan,
  newThemeId: string,
  now: number
): Promise<void> {
  if (!plan.isDuplicateUpload) return;

  const currentRows = await db
    .prepare(
      `SELECT id, slug, version_index FROM custom_themes
       WHERE version_group_id = ? AND is_current_version = 1 AND id != ?`
    )
    .bind(plan.versionGroupId, newThemeId)
    .all<{ id: string; slug: string; version_index: number }>();

  for (const row of currentRows.results ?? []) {
    const archivedSlug = versionedSlugArchive(row.slug, row.version_index);
    await db
      .prepare('UPDATE custom_themes SET slug = ?, is_current_version = 0, updated_at = ? WHERE id = ?')
      .bind(archivedSlug, now, row.id)
      .run();
  }

  await db
    .prepare(
      `UPDATE custom_themes SET is_current_version = 0, updated_at = ?
       WHERE version_group_id = ? AND id != ?`
    )
    .bind(now, plan.versionGroupId, newThemeId)
    .run();
}

export function formatThemeVersionLabel(versionIndex: number): string {
  return `1.0.${Math.max(1, versionIndex)}`;
}

export function versionPlanFromExistingTheme(
  theme: Record<string, unknown>,
  preferredSlug: string
): CustomThemeVersionPlan {
  return {
    versionGroupId: String(theme.version_group_id ?? theme.id),
    versionIndex: Number(theme.version_index ?? 1),
    canonicalSlug: String(theme.slug ?? preferredSlug),
    isDuplicateUpload: false,
    priorVersionCount: 0
  };
}