import { requireAdmin } from '../../../../../utils/auth';
import { drainSurveyEmailQueue } from '../../../../../utils/survey-email-queue';
import { getDbFromEvent, getSurveyBySlug } from '../../../../../utils/surveys';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const slug = getRouterParam(event, 'slug');
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Survey slug is required' });
  }

  const body = await readBody<{ useFullQuota?: boolean }>(event).catch(() => ({}));
  const useFullQuota = body?.useFullQuota !== false;

  const db = getDbFromEvent(event);
  const survey = await getSurveyBySlug(db, slug);
  if (!survey) {
    throw createError({ statusCode: 404, statusMessage: 'Survey not found' });
  }

  const emailDrain = await drainSurveyEmailQueue(db, event, {
    surveyId: survey.id,
    useFullQuota,
    ignoreQuota: useFullQuota,
  });

  return {
    ok: true,
    slug,
    use_full_quota: useFullQuota,
    ignore_quota: useFullQuota,
    email_drain: emailDrain.skipped
      ? {
          skipped: true,
          reason: emailDrain.reason,
          quotaResetAt: emailDrain.quotaResetAt,
          error: emailDrain.error,
          quota: emailDrain.quota,
        }
      : {
          batchSize: emailDrain.batchSize,
          sent: emailDrain.sent,
          failed: emailDrain.failed,
          skipped_invalid: emailDrain.skippedInvalid,
          failedDetails: emailDrain.failedDetails,
          quota: emailDrain.quota,
        },
  };
});
