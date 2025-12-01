import { getDB } from '../../utils/db';
import { flushSessions, flushDesqtaSessions } from '../../utils/analytics';

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
    const sessionsFlushed = await flushSessions(db);
    const desqtaSessionsFlushed = await flushDesqtaSessions(db);
    return { 
      success: true, 
      flushed: {
        sessions: sessionsFlushed,
        desqtaSessions: desqtaSessionsFlushed
      }
    };
  } catch (e) {
    throw createError({ statusCode: 500, message: 'Failed to flush sessions' });
  }
});

