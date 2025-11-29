import { getDB } from '../../utils/db';
import { flushBuffer } from '../../utils/analytics';

export default defineEventHandler(async (event) => {
  // Auth check
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || user.is_admin !== 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const db = getDB(event);
  
  try {
    const count = await flushBuffer(db);
    return { success: true, flushed: count };
  } catch (e) {
    throw createError({ statusCode: 500, message: 'Failed to flush views' });
  }
});

