/**
 * Questionnaire analytics - admin only.
 * Aggregates daily question and vote stats.
 */
import { getDB } from '../../utils/db';
import { getHeader } from 'h3';
import { getQuestionnaireBufferStats } from '../../utils/questionnaire';

export default defineEventHandler(async (event) => {
  const user = await $fetch<any>('/api/auth/me', {
    headers: { cookie: getHeader(event, 'cookie') || '' },
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const db = getDB(event);

  try {
    const summary = await db
      .prepare(
        `SELECT 
          (SELECT COUNT(*) FROM daily_questions) as total_questions,
          (SELECT COUNT(*) FROM question_votes) as total_votes,
          (SELECT COUNT(DISTINCT user_id) FROM question_votes) as unique_voters,
          (SELECT COALESCE(SUM(total_votes), 0) FROM question_results) as votes_in_results`
      )
      .first() as any;

    const bufferStats = getQuestionnaireBufferStats();

    const questionsWithVotes = await db
      .prepare(
        `SELECT 
          dq.id,
          dq.question,
          dq.is_active,
          dq.expires_at,
          COALESCE(qr.total_votes, 0) as total_votes
         FROM daily_questions dq
         LEFT JOIN question_results qr ON dq.id = qr.question_id
         ORDER BY dq.expires_at DESC
         LIMIT 20`
      )
      .all();

    return {
      summary: {
        totalQuestions: summary?.total_questions ?? 0,
        totalVotes: (summary?.total_votes ?? 0) + (bufferStats?.totalBuffered ?? 0),
        uniqueVoters: summary?.unique_voters ?? 0,
        votesInResults: summary?.votes_in_results ?? 0,
        bufferTotal: bufferStats?.totalBuffered ?? 0,
      },
      questions: (questionsWithVotes?.results || []).map((r: any) => ({
        id: r.id,
        question: r.question,
        is_active: r.is_active,
        expires_at: r.expires_at,
        total_votes: r.total_votes,
      })),
    };
  } catch (e) {
    console.error('[Analytics] Failed to fetch questionnaire stats:', e);
    throw createError({ statusCode: 500, message: 'Database error' });
  }
});
