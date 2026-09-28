import {
  enrichSurveyResponsesWithMemberInfo,
  getDbFromEvent,
  getSurveyBySlug,
  parseSurveyAnswersJson,
  type ParsedSurveyResponse,
} from '../../../../utils/surveys';
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

  const query = getQuery(event);
  const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 500);
  const offset = Math.max(Number(query.offset) || 0, 0);

  const rows = await db
    .prepare(
      `SELECT id, user_id, signup_number, answers_json, completed_at
       FROM survey_responses
       WHERE survey_id = ?
       ORDER BY completed_at DESC
       LIMIT ? OFFSET ?`
    )
    .bind(survey.id, limit, offset)
    .all();

  const totalRow = await db
    .prepare(`SELECT COUNT(*) AS count FROM survey_responses WHERE survey_id = ?`)
    .bind(survey.id)
    .first<{ count: number }>();

  const parsed: ParsedSurveyResponse[] = (rows.results || []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    signup_number: row.signup_number,
    answers_json: row.answers_json,
    completed_at: row.completed_at,
    answers: parseSurveyAnswersJson(row.answers_json),
  }));

  const enriched = await enrichSurveyResponsesWithMemberInfo(event, db, survey.id, parsed);

  return {
    responses: enriched.map(({ answers_json, ...response }) => response),
    total: Number(totalRow?.count) || 0,
    limit,
    offset,
  };
});
