import { getDB } from '../../utils/db';
import { convertUTCToACST, formatACSTDateTime, getTimezoneLabel } from '../../utils/timezone';

export default defineEventHandler(async (event) => {
  // Check Auth
  const user = await $fetch<any>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const db = getDB(event);

  try {
    const questions = await db.prepare(`
      SELECT dq.*, 
             COALESCE(qr.total_votes, 0) as total_votes,
             COALESCE(qr.option1_count, 0) as option1_count,
             COALESCE(qr.option2_count, 0) as option2_count,
             COALESCE(qr.option3_count, 0) as option3_count,
             COALESCE(qr.option4_count, 0) as option4_count
      FROM daily_questions dq
      LEFT JOIN question_results qr ON dq.id = qr.question_id
      ORDER BY 
        CASE WHEN dq.is_active = 1 THEN 0 ELSE 1 END,
        dq.queue_order ASC,
        dq.created_at ASC
    `).all();

    const now = Math.floor(Date.now() / 1000);

    return questions.results.map((q: any) => ({
      id: q.id,
      question: q.question,
      options: [
        q.option1,
        q.option2,
        q.option3,
        q.option4
      ].filter(Boolean),
      cover_image: q.cover_image,
      expires_at: q.expires_at,
      expires_at_acst: convertUTCToACST(q.expires_at),
      expires_at_formatted: formatACSTDateTime(q.expires_at),
      timezone_label: getTimezoneLabel(q.expires_at),
      is_expired: q.expires_at <= now,
      created_at: q.created_at,
      is_active: q.is_active,
      total_votes: q.total_votes,
      queue_order: q.queue_order || null,
      auto_activate: q.auto_activate || 0,
      duration: q.duration || null,
      vote_counts: {
        option1: q.option1_count,
        option2: q.option2_count,
        option3: q.option3_count,
        option4: q.option4_count
      }
    }));
  } catch (e: any) {
    console.error('[Questionnaire] Failed to get questions:', e);
    throw createError({ statusCode: 500, message: 'Failed to get questions', cause: e });
  }
});
