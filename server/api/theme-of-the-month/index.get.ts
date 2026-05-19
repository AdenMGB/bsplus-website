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

  const db = getDB(event);

  try {
    const entries = await db.prepare(`
      SELECT t.*, th.name AS theme_name, th.slug AS theme_slug
      FROM theme_of_the_month t
      LEFT JOIN themes th ON th.id = t.theme_id
      ORDER BY t.month DESC
    `).all();

    return entries.results.map((e: any) => ({
      id: e.id,
      month: e.month,
      title: e.title,
      description: e.description,
      cover_image: e.cover_image,
      cover_image_uploaded_at: e.cover_image_uploaded_at,
      theme_id: e.theme_id,
      theme: e.theme_id ? { id: e.theme_id, name: e.theme_name, slug: e.theme_slug } : null,
      created_at: e.created_at,
      updated_at: e.updated_at
    }));
  } catch (e: any) {
    console.error('[ThemeOfTheMonth] Failed to list entries:', e);
    throw createError({ statusCode: 500, message: 'Failed to list theme of the month entries', cause: e });
  }
});
