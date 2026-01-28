import { getDB } from '../../utils/db';

export default defineEventHandler(async (event): Promise<{ hasVoted: boolean }> => {
  // Check Auth
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const query = getQuery(event);
  const questionId = query.questionId as string;

  if (!questionId) {
    throw createError({ statusCode: 400, message: 'Missing questionId parameter' });
  }

  const db = getDB(event);

  try {
    const vote: any = await db.prepare(`
      SELECT id FROM question_votes 
      WHERE question_id = ? AND user_id = ?
    `).bind(questionId, user.id).first();

    return { hasVoted: !!vote };
  } catch (e: any) {
    console.error('[Questionnaire] Failed to check vote status:', e);
    throw createError({ statusCode: 500, message: 'Failed to check vote status', cause: e });
  }
});
