import { getDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  // Check Auth
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || user.is_admin !== 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const query = getQuery(event);
  const slug = query.slug as string;
  const body = await readBody(event);
  
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Invalid slug parameter' });
  }

  const db = getDB(event);

  try {
    // Check if post exists
    const existing = await db.prepare('SELECT id, published FROM news WHERE slug = ?').bind(slug).first();
    if (!existing) {
      throw createError({ statusCode: 404, message: 'Post not found' });
    }

    // Toggle published status (use body.published if provided, otherwise toggle)
    const newPublishedStatus = body.published !== undefined ? body.published : !existing.published;

    await db.prepare(
      `UPDATE news 
       SET published = ?, updated_at = unixepoch() 
       WHERE slug = ?`
    ).bind(
      newPublishedStatus ? 1 : 0,
      slug
    ).run();

    return { success: true, published: newPublishedStatus };
  } catch (e: any) {
    console.error('[API Error] Toggle publish failed:', e);
    if (e.statusCode) throw e;
    throw createError({ statusCode: 500, message: 'Database error', cause: e });
  }
});

