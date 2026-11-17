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

  const id = event.path.split('?')[0].split('/').pop();
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid id' });
  }

  const db = getDB(event);

  try {
    const entry = await db.prepare('SELECT * FROM theme_of_the_month WHERE id = ? LIMIT 1').bind(id).first();

    if (!entry) {
      throw createError({ statusCode: 404, message: 'Theme of the month entry not found' });
    }

    const theme = await resolveTotmLinkedTheme(
      db,
      entry.theme_id as string | null,
      entry.theme_source
    );

    return formatTotmEntry(entry as Record<string, unknown>, theme);
  } catch (e: any) {
    if (e.statusCode) throw e;
    console.error('[ThemeOfTheMonth] Failed to get entry:', e);
    throw createError({ statusCode: 500, message: 'Failed to get theme of the month entry', cause: e });
  }
});