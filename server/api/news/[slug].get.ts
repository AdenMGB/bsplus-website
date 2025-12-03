import { getDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const slug = event.path.split('/').pop();

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Invalid slug parameter' });
  }

  const db = getDB(event);

  try {
    const item = await db.prepare('SELECT * FROM news WHERE slug = ?').bind(slug).first();
    
    if (!item) {
      throw createError({ statusCode: 404, message: 'News item not found' });
    }

    // Access Control Logic
    if (item.published === 1) {
      return item;
    }

    // Check for preview token
    const query = getQuery(event);
    const previewToken = query.preview as string;

    if (previewToken && item.preview_token === previewToken) {
      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (item.preview_expires_at && item.preview_expires_at > now) {
        return item;
      }
    }

    // Check for admin auth
    const user = await $fetch<any>('/api/auth/me', {
      headers: {
        cookie: getHeader(event, 'cookie') || ''
      }
    }).catch(() => null);

    if (user && user.is_admin === 1) {
      return item;
    }

    // If neither published, nor valid preview, nor admin -> 404 (to hide draft existence)
    throw createError({ statusCode: 404, message: 'News item not found' });

  } catch (e: any) {
    if (e.statusCode) throw e;
    console.error('[API Error] Database error:', e);
    throw createError({ statusCode: 500, message: 'Database error', cause: e });
  }
});
