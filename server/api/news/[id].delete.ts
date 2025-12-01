import { getDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || user.is_admin !== 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const id = event.path.split('/').pop();
  
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid ID parameter' });
  }

  const db = getDB(event);

  const { success } = await db.prepare('DELETE FROM news WHERE id = ?').bind(id).run();
  return { success };
});

