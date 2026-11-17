import { getDB } from '../../utils/db';
import { formatTotmEntry, resolveTotmLinkedTheme } from '../../utils/themeOfTheMonth';

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

    const theme = await resolveTotmLinkedTheme(
      db,
      entry.theme_id as string | null,
      entry.theme_source
    );

    return formatTotmEntry(entry as Record<string, unknown>, theme);
  } catch (e: any) {
    console.error('[ThemeOfTheMonth] Failed to get current entry:', e);
    throw createError({ statusCode: 500, message: 'Failed to get current theme of the month', cause: e });
  }
});