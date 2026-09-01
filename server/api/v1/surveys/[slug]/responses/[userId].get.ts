import { getDbFromEvent, getSurveyBySlug, getUserSurveyResponse } from '../../../../../utils/surveys';
import { requireServiceApiKey } from '../../../../../utils/requireServiceApiKey';

export default defineEventHandler(async (event) => {
  await requireServiceApiKey(event, 'surveys:read');

  const slug = getRouterParam(event, 'slug');
  const userId = getRouterParam(event, 'userId');

  if (!slug || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Survey slug and userId are required' });
  }

  const db = getDbFromEvent(event);
  const survey = await getSurveyBySlug(db, slug);
  if (!survey) {
    throw createError({ statusCode: 404, statusMessage: 'Survey not found' });
  }

  const response = await getUserSurveyResponse(db, survey.id, userId);

  return {
    slug: survey.slug,
    user_id: userId,
    completed: Boolean(response),
    completed_at: response?.completed_at ?? null,
    signup_number: response?.signup_number ?? null,
  };
});
