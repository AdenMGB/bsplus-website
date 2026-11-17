import { getDB } from '../../utils/db';
import {
  formatTotmEntry,
  parseTotmThemeSource,
  resolveTotmLinkedTheme,
  validateTotmThemeLink
} from '../../utils/themeOfTheMonth';

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
  const { month, title, description, cover_image, theme_id, theme_source } = body || {};

  if (!month || !title || !description) {
    throw createError({ statusCode: 400, message: 'Missing required fields: month, title, description' });
  }

  if (typeof month !== 'string' || !MONTH_RE.test(month)) {
    throw createError({ statusCode: 400, message: "Invalid month format. Use 'YYYY-MM'." });
  }

  const db = getDB(event);
  const linkedSource = theme_id ? parseTotmThemeSource(theme_source) : 'marketplace';

  try {
    if (theme_id) {
      await validateTotmThemeLink(db, theme_id, linkedSource);
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
        id, month, title, description, cover_image, cover_image_uploaded_at,
        theme_id, theme_source, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
    `).bind(
      id,
      month,
      title,
      description,
      cover_image || null,
      coverImageUploadedAt,
      theme_id || null,
      theme_id ? linkedSource : 'marketplace'
    ).run();

    const created = await db.prepare('SELECT * FROM theme_of_the_month WHERE id = ?').bind(id).first();
    const theme = await resolveTotmLinkedTheme(
      db,
      created.theme_id as string | null,
      created.theme_source
    );

    return formatTotmEntry(created as Record<string, unknown>, theme);
  } catch (e: any) {
    if (e.statusCode) throw e;
    console.error('[ThemeOfTheMonth] Failed to create entry:', e);
    throw createError({ statusCode: 500, message: 'Failed to create theme of the month entry', cause: e });
  }
});