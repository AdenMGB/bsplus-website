import { getDB } from '../../utils/db';
import { maybeRecordThemeCatalogEvent } from '../../utils/bsplusThemeAnalytics';

function getCurrentMonth(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

export default defineEventHandler(async (event) => {
  let db;
  try {
    db = getDB(event);
  } catch (e: any) {
    console.warn('[ThemeOfTheMonth] Database binding not available:', e.message);
    return null;
  }

  try {
    const month = getCurrentMonth();

    const entry = await db.prepare(`
      SELECT * FROM theme_of_the_month
      WHERE month = ?
      LIMIT 1
    `).bind(month).first();

    if (!entry) return null;

    maybeRecordThemeCatalogEvent(event, db, {
      query: getQuery(event) as Record<string, unknown>,
      eventType: 'totm',
      themeId: entry.theme_id ? String(entry.theme_id) : null,
      route: '/api/theme-of-the-month/current',
    });

    let theme: { id: string; name: string; slug: string } | null = null;
    if (entry.theme_id) {
      const themeRow = await db.prepare(`
        SELECT id, name, slug FROM themes WHERE id = ? LIMIT 1
      `).bind(entry.theme_id).first();
      if (themeRow) {
        theme = {
          id: themeRow.id,
          name: themeRow.name,
          slug: themeRow.slug
        };
      }
    }

    return {
      id: entry.id,
      month: entry.month,
      title: entry.title,
      description: entry.description,
      cover_image: entry.cover_image,
      theme_id: entry.theme_id,
      theme,
      created_at: entry.created_at,
      updated_at: entry.updated_at
    };
  } catch (e: any) {
    console.error('[ThemeOfTheMonth] Failed to get current entry:', e);
    throw createError({ statusCode: 500, message: 'Failed to get current theme of the month', cause: e });
  }
});
