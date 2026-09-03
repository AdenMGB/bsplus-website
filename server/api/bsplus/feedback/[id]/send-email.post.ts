/**
 * POST /api/bsplus/feedback/:id/send-email
 * Email the saved (or provided) admin response without changing triage fields.
 */
import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';
import { mapFeedbackRow } from '../../../utils/feedback';
import { sendFeedbackReplyEmail } from '../../../utils/feedback-mail';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, message: 'Feedback id is required' });
  }

  const body = await readBody<{ admin_response?: string }>(event).catch(() => ({}));
  const db = getDB(event);

  const row = await db
    .prepare('SELECT * FROM feedback_submissions WHERE id = ? LIMIT 1')
    .bind(id)
    .first<Record<string, any>>();

  if (!row) {
    throw createError({ statusCode: 404, message: 'Feedback not found' });
  }

  const overrideText = typeof body?.admin_response === 'string' ? body.admin_response.trim() : '';
  const replyText = overrideText || String(row.admin_response || '').trim();

  if (!replyText) {
    throw createError({
      statusCode: 400,
      message: 'No reply text to send. Save a response first or provide admin_response in the request body.',
    });
  }

  let emailSent = false;
  let emailError: string | null = null;

  try {
    const result = await sendFeedbackReplyEmail(row as any, replyText, event, {
      bypassQuota: true,
    });
    if (result.sent) {
      emailSent = true;
      await db
        .prepare(
          `UPDATE feedback_submissions
           SET response_emailed_at = unixepoch(), updated_at = unixepoch()
           WHERE id = ?`,
        )
        .bind(id)
        .run();
    } else {
      emailError = result.reason || 'Email was not sent';
    }
  } catch (e: any) {
    emailError = e?.statusMessage || e?.message || 'Failed to send email';
  }

  const updated = await db
    .prepare('SELECT * FROM feedback_submissions WHERE id = ? LIMIT 1')
    .bind(id)
    .first<Record<string, any>>();

  return {
    ...mapFeedbackRow(updated!, { includeUserAgent: true }),
    email_sent: emailSent,
    email_error: emailError,
  };
});
