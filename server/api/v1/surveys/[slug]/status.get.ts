import { getDbFromEvent, getSurveyBySlug, getSurveyStats, getUserSurveyResponse } from '../../../../utils/surveys';
import { requireServiceApiKey } from '../../../../utils/requireServiceApiKey';

export default defineEventHandler(async (event) => {
  await requireServiceApiKey(event, 'surveys:read');

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

  return {
    slug: survey.slug,
    title: survey.title,
    status: survey.status,
    active: survey.status === 'active',
    stats,
  };
});
