import { getDB } from '../../utils/db';
import { getBucket } from '../../utils/r2';

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

  const id = event.path.split('?')[0].split('/').pop();
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid id' });
  }

  const body = await readBody(event);
  const db = getDB(event);

  try {
    const existing = await db.prepare('SELECT * FROM theme_of_the_month WHERE id = ?')
      .bind(id).first();

    if (!existing) {
      throw createError({ statusCode: 404, message: 'Theme of the month entry not found' });
    }

    let oldCoverImage: string | null = null;
    if (body.cover_image !== undefined && body.cover_image !== existing.cover_image) {
      oldCoverImage = existing.cover_image;
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (body.month !== undefined) {
      if (typeof body.month !== 'string' || !MONTH_RE.test(body.month)) {
        throw createError({ statusCode: 400, message: "Invalid month format. Use 'YYYY-MM'." });
      }
      if (body.month !== existing.month) {
        const conflict = await db.prepare('SELECT id FROM theme_of_the_month WHERE month = ? AND id != ? LIMIT 1')
          .bind(body.month, id).first();
        if (conflict) {
          throw createError({ statusCode: 409, message: `An entry for ${body.month} already exists` });
        }
      }
      updates.push('month = ?');
      values.push(body.month);
    }

    if (body.title !== undefined) {
      updates.push('title = ?');
      values.push(body.title);
    }

    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description);
    }

    if (body.cover_image !== undefined) {
      updates.push('cover_image = ?');
      updates.push('cover_image_uploaded_at = ?');
      values.push(body.cover_image || null, body.cover_image ? Math.floor(Date.now() / 1000) : null);
    }

    if (body.theme_id !== undefined) {
      if (body.theme_id) {
        const existsTheme = await db.prepare('SELECT id FROM themes WHERE id = ? LIMIT 1').bind(body.theme_id).first();
        if (!existsTheme) {
          throw createError({ statusCode: 400, message: 'Linked theme does not exist' });
        }
      }
      updates.push('theme_id = ?');
      values.push(body.theme_id || null);
    }

    if (updates.length === 0) {
      throw createError({ statusCode: 400, message: 'No fields to update' });
    }

    updates.push('updated_at = unixepoch()');
    values.push(id);

    await db.prepare(`
      UPDATE theme_of_the_month
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...values).run();

    if (oldCoverImage && oldCoverImage.startsWith('/api/images/')) {
      const imageKey = oldCoverImage.replace('/api/images/', '');
      try {
        const bucket = getBucket(event);
        await bucket.delete(imageKey);
        console.log(`[ThemeOfTheMonth] Deleted old cover image: ${imageKey}`);
      } catch (e) {
        console.error('[ThemeOfTheMonth] Failed to delete old cover image:', e);
      }
    }

    const updated = await db.prepare(`
      SELECT t.*, th.name AS theme_name, th.slug AS theme_slug
      FROM theme_of_the_month t
      LEFT JOIN themes th ON th.id = t.theme_id
      WHERE t.id = ?
    `).bind(id).first();

    return {
      id: updated.id,
      month: updated.month,
      title: updated.title,
      description: updated.description,
      cover_image: updated.cover_image,
      cover_image_uploaded_at: updated.cover_image_uploaded_at,
      theme_id: updated.theme_id,
      theme: updated.theme_id ? { id: updated.theme_id, name: updated.theme_name, slug: updated.theme_slug } : null,
      created_at: updated.created_at,
      updated_at: updated.updated_at
    };
  } catch (e: any) {
    if (e.statusCode) throw e;
    console.error('[ThemeOfTheMonth] Failed to update entry:', e);
    throw createError({ statusCode: 500, message: 'Failed to update theme of the month entry', cause: e });
  }
});
