import { getDB } from '../../utils/db';

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
    const entry = await db.prepare(`
      SELECT t.*, th.name AS theme_name, th.slug AS theme_slug, th.theme_type AS theme_type
      FROM theme_of_the_month t
      LEFT JOIN themes th ON th.id = t.theme_id
      WHERE t.id = ?
      LIMIT 1
    `).bind(id).first();

    if (!entry) {
      throw createError({ statusCode: 404, message: 'Theme of the month entry not found' });
    }

    return {
      id: entry.id,
      month: entry.month,
      title: entry.title,
      description: entry.description,
      cover_image: entry.cover_image,
      cover_image_uploaded_at: entry.cover_image_uploaded_at,
      theme_id: entry.theme_id,
      theme: entry.theme_id
        ? { id: entry.theme_id, name: entry.theme_name, slug: entry.theme_slug, theme_type: entry.theme_type }
        : null,
      created_at: entry.created_at,
      updated_at: entry.updated_at
    };
  } catch (e: any) {
    if (e.statusCode) throw e;
    console.error('[ThemeOfTheMonth] Failed to get entry:', e);
    throw createError({ statusCode: 500, message: 'Failed to get theme of the month entry', cause: e });
  }
});
