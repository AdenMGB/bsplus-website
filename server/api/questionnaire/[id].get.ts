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

  const id = event.path.split('/').pop();
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid question ID' });
  }

  const db = getDB(event);

  try {
    const question = await db.prepare(`
      SELECT dq.*, 
             COALESCE(qr.total_votes, 0) as total_votes,
             COALESCE(qr.option1_count, 0) as option1_count,
             COALESCE(qr.option2_count, 0) as option2_count,
             COALESCE(qr.option3_count, 0) as option3_count,
             COALESCE(qr.option4_count, 0) as option4_count
      FROM daily_questions dq
      LEFT JOIN question_results qr ON dq.id = qr.question_id
      WHERE dq.id = ?
    `).bind(id).first();

    if (!question) {
      throw createError({ statusCode: 404, message: 'Question not found' });
    }

    const now = Math.floor(Date.now() / 1000);

    return {
      id: question.id,
      question: question.question,
      options: [
        question.option1,
        question.option2,
        question.option3,
        question.option4
      ].filter(Boolean),
      cover_image: question.cover_image,
      cover_image_uploaded_at: question.cover_image_uploaded_at,
      expires_at: question.expires_at,
      expires_at_acst: convertUTCToACST(question.expires_at),
      expires_at_formatted: formatACSTDateTime(question.expires_at),
      timezone_label: getTimezoneLabel(question.expires_at),
      is_expired: question.expires_at <= now,
      created_at: question.created_at,
      is_active: question.is_active,
      total_votes: question.total_votes,
      vote_counts: {
        option1: question.option1_count,
        option2: question.option2_count,
        option3: question.option3_count,
        option4: question.option4_count
      }
    };
  } catch (e: any) {
    console.error('[Questionnaire] Failed to get question:', e);
    if (e.statusCode) throw e;
    throw createError({ statusCode: 500, message: 'Failed to get question', cause: e });
  }
});
