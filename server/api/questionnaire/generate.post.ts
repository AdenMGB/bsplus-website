import { getAI } from '../../utils/ai';
import { getDB } from '../../utils/db';
import { generateQuestionnaireQuestions } from '../../utils/questionnaire-generate';

export default defineEventHandler(async (event) => {
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const body = await readBody(event);
  const count = Math.min(Math.max(Number(body?.count) || 3, 1), 5);
  const topic = typeof body?.topic === 'string' ? body.topic.trim() : undefined;

  const db = getDB(event);
  const ai = getAI(event);

  try {
    const previous = await db.prepare(`
      SELECT question, option1, option2, option3, option4
      FROM daily_questions
      ORDER BY created_at DESC
      LIMIT 15
    `).all();

    const questions = await generateQuestionnaireQuestions(
      ai,
      previous.results ?? [],
      count,
      topic
    );

    return { questions };
  } catch (e: any) {
    console.error('[Questionnaire] Failed to generate questions:', e);
    throw createError({
      statusCode: 500,
      message: e.message || 'Failed to generate questions with AI',
      cause: e
    });
  }
});
