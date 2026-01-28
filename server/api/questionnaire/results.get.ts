import { getDB } from '../../utils/db';
import { getQuestionnaireBufferStats } from '../../utils/questionnaire';

export default defineEventHandler(async (event) => {
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
    // Check if user has voted
    const vote = await db.prepare(`
      SELECT id FROM question_votes 
      WHERE question_id = ? AND user_id = ?
    `).bind(questionId, user.id).first();

    if (!vote) {
      throw createError({ statusCode: 403, message: 'You must vote before viewing results' });
    }

    // Get question
    const question = await db.prepare(`
      SELECT * FROM daily_questions WHERE id = ?
    `).bind(questionId).first();

    if (!question) {
      throw createError({ statusCode: 404, message: 'Question not found' });
    }

    // Get results from database
    const results = await db.prepare(`
      SELECT * FROM question_results WHERE question_id = ?
    `).bind(questionId).first();

    // Get buffered votes
    const bufferStats = getQuestionnaireBufferStats();
    
    // Calculate totals (database + buffer)
    const optionCounts = {
      1: (results?.option1_count || 0),
      2: (results?.option2_count || 0),
      3: (results?.option3_count || 0),
      4: (results?.option4_count || 0)
    };

    // Note: Buffer stats don't give us per-question breakdown easily
    // For now, we'll use database results. Buffer will be flushed periodically.
    // In a production system, you might want to merge buffer data here.

    const totalVotes = results?.total_votes || 0;

    // Build options with counts and percentages
    const options = [];
    for (let i = 1; i <= 4; i++) {
      const optionKey = `option${i}` as keyof typeof question;
      if (question[optionKey]) {
        const count = optionCounts[i as keyof typeof optionCounts];
        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        options.push({
          index: i,
          text: question[optionKey],
          count,
          percentage
        });
      }
    }

    return {
      questionId,
      totalVotes,
      options
    };
  } catch (e: any) {
    console.error('[Questionnaire] Failed to get results:', e);
    if (e.statusCode) throw e;
    throw createError({ statusCode: 500, message: 'Failed to get results', cause: e });
  }
});
