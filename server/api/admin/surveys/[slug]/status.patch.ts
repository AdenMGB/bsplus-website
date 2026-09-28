import { getDbFromEvent, getSurveyBySlug } from '../../../../utils/surveys';
import { requireAdmin } from '../../../../utils/auth';

const VALID_STATUSES = new Set(['draft', 'active', 'closed']);

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const slug = getRouterParam(event, 'slug');
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Survey slug is required' });
  }

  const body = await readBody<{ status?: string }>(event);
  const status = String(body?.status || '').trim();
  if (!VALID_STATUSES.has(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid survey status' });
  }

  const db = getDbFromEvent(event);
  const survey = await getSurveyBySlug(db, slug);
  if (!survey) {
    throw createError({ statusCode: 404, statusMessage: 'Survey not found' });
  }

  const activatedAt = status === 'active' ? Math.floor(Date.now() / 1000) : survey.activated_at;

  await db
    .prepare(`UPDATE surveys SET status = ?, activated_at = ? WHERE id = ?`)
    .bind(status, activatedAt, survey.id)
    .run();

  return { ok: true, slug, status };
});
