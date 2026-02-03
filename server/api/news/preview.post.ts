import { getDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  // Check Auth
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const query = getQuery(event);
  const slug = query.slug as string;
  
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Invalid slug parameter' });
  }

  const body = await readBody(event);
  const durationMinutes = body.duration; // in minutes

  if (!durationMinutes || typeof durationMinutes !== 'number') {
    throw createError({ statusCode: 400, message: 'Invalid duration' });
  }

  const db = getDB(event);

  try {
    // Generate a random token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = Math.floor(Date.now() / 1000) + (durationMinutes * 60);

    const result = await db.prepare(
      `UPDATE news 
       SET preview_token = ?, preview_expires_at = ?
       WHERE slug = ?`
    ).bind(
      token,
      expiresAt,
      slug
    ).run();

    if (result.meta.changes === 0) {
      throw createError({ statusCode: 404, message: 'Post not found' });
    }

    return { success: true, token, expiresAt };
  } catch (e: any) {
    console.error('[API Error] Generate preview failed:', e);
    if (e.statusCode) throw e;
    throw createError({ statusCode: 500, message: 'Database error', cause: e });
  }
});

