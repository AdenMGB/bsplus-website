import { getDbFromEvent, getSurveyBySlug, getSurveyStats } from '../../../../utils/surveys';
import { requireAdmin } from '../../../../utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const slug = getRouterParam(event, 'slug');
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Survey slug is required' });
  }

  const db = getDbFromEvent(event);
  const survey = await getSurveyBySlug(db, slug);
  if (!survey) {
    throw createError({ statusCode: 404, statusMessage: 'Survey not found' });
  }

  const stats = await getSurveyStats(db, survey.id);

  const recentResponses = await db
    .prepare(
      `SELECT id, user_id, signup_number, answers_json, completed_at
       FROM survey_responses
       WHERE survey_id = ?
       ORDER BY completed_at DESC
       LIMIT 10`
    )
    .bind(survey.id)
    .all();

  const queuePreview = await db
    .prepare(
      `SELECT status, COUNT(*) AS count
       FROM survey_email_queue
       WHERE survey_id = ?
       GROUP BY status`
    )
    .bind(survey.id)
    .all();

  return {
    survey,
    stats,
    recent_responses: recentResponses.results || [],
    queue_by_status: queuePreview.results || [],
  };
});
