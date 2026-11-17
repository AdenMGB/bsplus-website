export type TotmThemeSource = 'marketplace' | 'community';

export function parseTotmThemeSource(value: unknown): TotmThemeSource {
  return value === 'community' ? 'community' : 'marketplace';
}

export async function validateTotmThemeLink(
  db: ReturnType<typeof import('./db').getDB>,
  themeId: string,
  themeSource: TotmThemeSource
): Promise<void> {
  if (themeSource === 'community') {
    const row = await db
      .prepare(
        `SELECT id, theme_type, status FROM custom_themes
         WHERE id = ? AND status = 'approved' AND is_current_version = 1
         LIMIT 1`
      )
      .bind(themeId)
      .first<{ id: string; theme_type?: string } | null>();
    if (!row) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'Linked community theme does not exist, is not approved, or is superseded by a newer version'
      });
    }
    if (row.theme_type !== 'betterseqta') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Theme of the month can only link to BetterSEQTA+ themes'
      });
    }
    return;
  }

  const row = await db
    .prepare('SELECT id, theme_type FROM themes WHERE id = ? LIMIT 1')
    .bind(themeId)
    .first<{ id: string; theme_type?: string } | null>();
  if (!row) {
    throw createError({ statusCode: 400, statusMessage: 'Linked theme does not exist' });
  }
  if (row.theme_type !== 'betterseqta') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme of the month can only link to BetterSEQTA+ themes'
    });
  }
}

export async function resolveTotmLinkedTheme(
  db: ReturnType<typeof import('./db').getDB>,
  themeId: string | null | undefined,
  themeSource: TotmThemeSource | string | null | undefined
): Promise<{
  id: string;
  name: string;
  slug: string;
  theme_type: 'betterseqta';
  theme_source: TotmThemeSource;
  theme_json_url?: string | null;
} | null> {
  if (!themeId) return null;

  const source = parseTotmThemeSource(themeSource);

  if (source === 'community') {
    const row = await db
      .prepare(
        `SELECT id, name, slug, theme_type, theme_json_url
         FROM custom_themes
         WHERE id = ? AND status = 'approved' AND is_current_version = 1
         LIMIT 1`
      )
      .bind(themeId)
      .first<{
        id: string;
        name: string;
        slug: string;
        theme_type?: string;
        theme_json_url?: string | null;
      } | null>();
    if (!row || row.theme_type !== 'betterseqta') return null;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      theme_type: 'betterseqta',
      theme_source: 'community',
      theme_json_url: row.theme_json_url ?? null
    };
  }

  const row = await db
    .prepare('SELECT id, name, slug, theme_type, theme_json_url FROM themes WHERE id = ? LIMIT 1')
    .bind(themeId)
    .first<{
      id: string;
      name: string;
      slug: string;
      theme_type?: string;
      theme_json_url?: string | null;
    } | null>();
  if (!row || row.theme_type !== 'betterseqta') return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    theme_type: 'betterseqta',
    theme_source: 'marketplace',
    theme_json_url: row.theme_json_url ?? null
  };
}

export function formatTotmEntry(
  entry: Record<string, unknown>,
  theme: Awaited<ReturnType<typeof resolveTotmLinkedTheme>>
) {
  const themeSource = parseTotmThemeSource(entry.theme_source);
  return {
    id: entry.id,
    month: entry.month,
    title: entry.title,
    description: entry.description,
    cover_image: entry.cover_image,
    cover_image_uploaded_at: entry.cover_image_uploaded_at,
    theme_id: entry.theme_id,
    theme_source: entry.theme_id ? themeSource : null,
    theme,
    created_at: entry.created_at,
    updated_at: entry.updated_at
  };
}