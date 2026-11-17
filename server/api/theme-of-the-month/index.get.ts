import { getDB } from '../../utils/db';
import { formatTotmEntry, resolveTotmLinkedTheme } from '../../utils/themeOfTheMonth';

export default defineEventHandler(async (event) => {
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const db = getDB(event);

  try {
    const entries = await db.prepare(`
      SELECT * FROM theme_of_the_month
      ORDER BY month DESC
    `).all();

    const rows = entries.results ?? [];
    const formatted = [];
    for (const entry of rows) {
      const theme = await resolveTotmLinkedTheme(
        db,
        entry.theme_id as string | null,
        entry.theme_source
      );
      formatted.push(formatTotmEntry(entry as Record<string, unknown>, theme));
    }

    return formatted;
  } catch (e: any) {
    console.error('[ThemeOfTheMonth] Failed to list entries:', e);
    throw createError({ statusCode: 500, message: 'Failed to list theme of the month entries', cause: e });
  }
});