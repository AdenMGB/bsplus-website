import { getDbFromEvent, getSurveyBySlug } from '../../../../../utils/surveys';
import { requireAdmin } from '../../../../../utils/auth';
import { fetchSignupOrderExport } from '../../../../../utils/survey-accounts';
import { generateSurveyInviteToken } from '../../../../../utils/survey-invite';
import { drainSurveyEmailQueue } from '../../../../../utils/survey-email-queue';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const slug = getRouterParam(event, 'slug');
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Survey slug is required' });
  }

  const body = await readBody<{ limit?: number }>(event);
  const limit = Math.min(Math.max(Number(body?.limit) || 2500, 1), 5000);

  const db = getDbFromEvent(event);
  const survey = await getSurveyBySlug(db, slug);
  if (!survey) {
    throw createError({ statusCode: 404, statusMessage: 'Survey not found' });
  }

  const exportData = await fetchSignupOrderExport(event, limit, 0);
  const users = exportData.users || [];

  let inserted = 0;
  let skippedExisting = 0;
  let skippedResponded = 0;
  let skippedInvalidEmail = 0;

  for (const user of users) {
    if (!user.signup_number || user.signup_number > 2500) {
      continue;
    }

    const email = user.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      skippedInvalidEmail++;
      continue;
    }

    const responded = await db
      .prepare(
        `SELECT id FROM survey_responses WHERE survey_id = ? AND user_id = ? LIMIT 1`
      )
      .bind(survey.id, user.id)
      .first();

    if (responded) {
      skippedResponded++;
      continue;
    }

    const existingQueue = await db
      .prepare(
        `SELECT id, status FROM survey_email_queue
         WHERE survey_id = ? AND user_id = ?
         AND status IN ('pending', 'sent')
         LIMIT 1`
      )
      .bind(survey.id, user.id)
      .first<{ id: string; status: string }>();

    if (existingQueue) {
      skippedExisting++;
      continue;
    }

    const inviteToken = generateSurveyInviteToken();
    const queueId = crypto.randomUUID();

    await db
      .prepare(
        `INSERT INTO survey_email_queue (
          id, survey_id, user_id, email, display_name, signup_number, invite_token, status, attempts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0)`
      )
      .bind(
        queueId,
        survey.id,
        user.id,
        email,
        user.displayName || user.username || null,
        user.signup_number,
        inviteToken
      )
      .run();

    inserted++;
  }

  const emailDrain = await drainSurveyEmailQueue(db, event, { surveyId: survey.id });

  return {
    ok: true,
    slug,
    scanned: users.length,
    inserted,
    skipped_existing_queue: skippedExisting,
    skipped_already_responded: skippedResponded,
    skipped_invalid_email: skippedInvalidEmail,
    email_drain: emailDrain.skipped
      ? {
          skipped: true,
          reason: emailDrain.reason,
          quotaResetAt: emailDrain.quotaResetAt,
          error: emailDrain.error,
        }
      : {
          batchSize: emailDrain.batchSize,
          sent: emailDrain.sent,
          failed: emailDrain.failed,
          skipped_invalid: emailDrain.skippedInvalid,
          failedDetails: emailDrain.failedDetails,
        },
  };
});
