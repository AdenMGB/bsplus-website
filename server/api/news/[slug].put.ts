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

  const slug = getRouterParam(event, 'slug');
  const body = await readBody(event);
  
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Invalid slug parameter' });
  }

  const db = getDB(event);

  try {
    // Check if post exists
    const existing = await db.prepare('SELECT id FROM news WHERE slug = ?').bind(slug).first();
    if (!existing) {
      throw createError({ statusCode: 404, message: 'Post not found' });
    }

    // Check if new slug conflicts with another post (if slug changed)
    if (body.slug !== slug) {
       const conflict = await db.prepare('SELECT id FROM news WHERE slug = ? AND id != ?').bind(body.slug, existing.id).first();
       if (conflict) {
         throw createError({ statusCode: 409, message: 'Slug already in use' });
       }
    }

    await db.prepare(
      `UPDATE news 
       SET title = ?, slug = ?, content = ?, published = ?, updated_at = unixepoch() 
       WHERE slug = ?`
    ).bind(
      body.title,
      body.slug,
      body.content,
      body.published ? 1 : 0,
      slug
    ).run();

    return { success: true };
  } catch (e: any) {
    console.error('[API Error] Update post failed:', e);
    if (e.statusCode) throw e;
    throw createError({ statusCode: 500, message: 'Database error', cause: e });
  }
});

