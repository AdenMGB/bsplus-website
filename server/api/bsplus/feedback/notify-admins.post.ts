/**
 * POST /api/bsplus/feedback/notify-admins
 * Send admin digest for unnotified feedback.
 * Auth: admin session, or Wrangler cron via `cf-cron: true`.
 */
import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';
import { sendAdminFeedbackDigest } from '../../../utils/feedback-mail';

export default defineEventHandler(async (event) => {
  const isCron = getHeader(event, 'cf-cron') === 'true';
  if (!isCron) {
    await requireAdmin(event);
  }

  const db = getDB(event);

  try {
    const result = await sendAdminFeedbackDigest(db, event);
    return { ok: true, ...result };
  } catch (e: any) {
    if (e.statusCode) throw e;
    throw createError({
      statusCode: 500,
      message: 'Failed to notify admins',
      cause: e,
    });
  }
});
