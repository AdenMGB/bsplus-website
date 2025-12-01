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

  const body = await readBody(event);
  const db = getDB(event);

  const { title, slug, content, published, cover_image } = body;

  try {
    const { success } = await db.prepare(
      `INSERT INTO news (title, slug, content, author_id, author_name, author_avatar, cover_image, published, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`
    ).bind(
      title,
      slug,
      content,
      user.id,
      user.displayName || user.username,
      user.pfpUrl,
      cover_image || null,
      published ? 1 : 0
    ).run();

    return { success };
  } catch (e: any) {
    if (e.message && e.message.includes('UNIQUE constraint failed')) {
      throw createError({ statusCode: 409, message: 'Slug already exists' });
    }
    throw e;
  }
});

