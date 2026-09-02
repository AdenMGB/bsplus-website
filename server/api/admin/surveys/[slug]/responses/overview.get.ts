import { requireAdmin } from '../../../../../utils/auth';
import {
  computeSurveyResponseOverview,
  enrichSurveyResponsesWithMemberInfo,
  getDbFromEvent,
  getSurveyBySlug,
  parseSurveyAnswersJson,
  type ParsedSurveyResponse,
} from '../../../../../utils/surveys';

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

  const rows = await db
    .prepare(
      `SELECT id, user_id, signup_number, answers_json, completed_at
       FROM survey_responses
       WHERE survey_id = ?
       ORDER BY completed_at DESC`,
    )
    .bind(survey.id)
    .all();

  const parsed: ParsedSurveyResponse[] = (rows.results || []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    signup_number: row.signup_number,
    answers_json: row.answers_json,
    completed_at: row.completed_at,
    answers: parseSurveyAnswersJson(row.answers_json),
  }));

  const enriched = await enrichSurveyResponsesWithMemberInfo(event, db, survey.id, parsed);
  const overview = computeSurveyResponseOverview(enriched);

  return {
    overview,
    responses: enriched.map(({ answers_json, ...response }) => response),
    total: enriched.length,
  };
});
