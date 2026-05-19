import { getDB } from '../../utils/db';

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export default defineEventHandler(async (event) => {
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const body = await readBody(event);
  const { month, title, description, cover_image, theme_id } = body || {};

  if (!month || !title || !description) {
    throw createError({ statusCode: 400, message: 'Missing required fields: month, title, description' });
  }

  if (typeof month !== 'string' || !MONTH_RE.test(month)) {
    throw createError({ statusCode: 400, message: "Invalid month format. Use 'YYYY-MM'." });
  }

  const db = getDB(event);

  try {
    if (theme_id) {
      const existsTheme = await db.prepare('SELECT id FROM themes WHERE id = ? LIMIT 1').bind(theme_id).first();
      if (!existsTheme) {
        throw createError({ statusCode: 400, message: 'Linked theme does not exist' });
      }
    }

    const existing = await db.prepare('SELECT id FROM theme_of_the_month WHERE month = ? LIMIT 1')
      .bind(month).first();
    if (existing) {
      throw createError({ statusCode: 409, message: `An entry for ${month} already exists` });
    }

    const id = crypto.randomUUID();
    const coverImageUploadedAt = cover_image ? Math.floor(Date.now() / 1000) : null;

    await db.prepare(`
      INSERT INTO theme_of_the_month (
        id, month, title, description, cover_image, cover_image_uploaded_at, theme_id, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
    `).bind(
      id,
      month,
      title,
      description,
      cover_image || null,
      coverImageUploadedAt,
      theme_id || null
    ).run();

    const created = await db.prepare(`
      SELECT t.*, th.name AS theme_name, th.slug AS theme_slug
      FROM theme_of_the_month t
      LEFT JOIN themes th ON th.id = t.theme_id
      WHERE t.id = ?
    `).bind(id).first();

    return {
      id: created.id,
      month: created.month,
      title: created.title,
      description: created.description,
      cover_image: created.cover_image,
      cover_image_uploaded_at: created.cover_image_uploaded_at,
      theme_id: created.theme_id,
      theme: created.theme_id ? { id: created.theme_id, name: created.theme_name, slug: created.theme_slug } : null,
      created_at: created.created_at,
      updated_at: created.updated_at
    };
  } catch (e: any) {
    if (e.statusCode) throw e;
    console.error('[ThemeOfTheMonth] Failed to create entry:', e);
    throw createError({ statusCode: 500, message: 'Failed to create theme of the month entry', cause: e });
  }
});
