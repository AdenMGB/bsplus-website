import { getDB } from '../../utils/db';
import { getBucket } from '../../utils/r2';

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
    const entry = await db.prepare('SELECT cover_image FROM theme_of_the_month WHERE id = ?')
      .bind(id).first();

    if (!entry) {
      throw createError({ statusCode: 404, message: 'Theme of the month entry not found' });
    }

    if (entry.cover_image && entry.cover_image.startsWith('/api/images/')) {
      const imageKey = entry.cover_image.replace('/api/images/', '');
      try {
        const bucket = getBucket(event);
        await bucket.delete(imageKey);
        console.log(`[ThemeOfTheMonth] Deleted cover image: ${imageKey}`);
      } catch (e) {
        console.error('[ThemeOfTheMonth] Failed to delete cover image:', e);
      }
    }

    await db.prepare('DELETE FROM theme_of_the_month WHERE id = ?').bind(id).run();

    return { success: true };
  } catch (e: any) {
    if (e.statusCode) throw e;
    console.error('[ThemeOfTheMonth] Failed to delete entry:', e);
    throw createError({ statusCode: 500, message: 'Failed to delete theme of the month entry', cause: e });
  }
});
