import { getDB } from '../../utils/db';
import { flushVotes } from '../../utils/questionnaire';

export default defineEventHandler(async (event): Promise<{ success: boolean; flushed: number }> => {
  // Check Auth
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  let db;
  try {
    db = getDB(event);
  } catch (e: any) {
    throw createError({ statusCode: 500, message: 'Database binding not available', cause: e });
  }

  try {
    const flushed = await flushVotes(db);
    return { success: true, flushed };
  } catch (e: any) {
    console.error('[Questionnaire] Failed to sync votes:', e);
    throw createError({ statusCode: 500, message: 'Failed to sync votes', cause: e });
  }
});
