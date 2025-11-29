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

    return item;
  } catch (e: any) {
    console.error('[API Error] Database error:', e);
    throw createError({ statusCode: 500, message: 'Database error', cause: e });
  }
});
