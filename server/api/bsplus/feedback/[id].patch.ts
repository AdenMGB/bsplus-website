/**
 * PATCH /api/bsplus/feedback/:id
 * Admin triage update (status / notes / response).
 * Set `send_email: true` with `admin_response` to email the user via BS Mail API.
 */
import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';
import {
  FEEDBACK_STATUSES,
  mapFeedbackRow,
  type FeedbackStatus,
} from '../../../utils/feedback';
import { sendFeedbackReplyEmail } from '../../../utils/feedback-mail';

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event);

  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, message: 'Feedback id is required' });
  }

  const body = await readBody(event).catch(() => null);
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, message: 'Invalid JSON body' });
  }

  const updates: string[] = [];
  const params: unknown[] = [];
  const sendEmail = body.send_email === true;

  if (body.status !== undefined) {
    if (
      typeof body.status !== 'string' ||
      !FEEDBACK_STATUSES.includes(body.status as FeedbackStatus)
    ) {
      throw createError({
        statusCode: 400,
        message: `status must be one of: ${FEEDBACK_STATUSES.join(', ')}`,
      });
    }
    updates.push('status = ?');
    params.push(body.status);
  }

  if (body.internal_notes !== undefined) {
    if (body.internal_notes !== null && typeof body.internal_notes !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'internal_notes must be a string or null',
      });
    }
    if (typeof body.internal_notes === 'string' && body.internal_notes.length > 4000) {
      throw createError({
        statusCode: 400,
        message: 'internal_notes must be at most 4000 characters',
      });
    }
    updates.push('internal_notes = ?');
    params.push(body.internal_notes);
  }

  let responseText: string | null = null;
  if (body.admin_response !== undefined) {
    if (body.admin_response !== null && typeof body.admin_response !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'admin_response must be a string or null',
      });
    }
    if (typeof body.admin_response === 'string' && body.admin_response.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: 'admin_response cannot be empty',
      });
    }
    if (typeof body.admin_response === 'string' && body.admin_response.length > 8000) {
      throw createError({
        statusCode: 400,
        message: 'admin_response must be at most 8000 characters',
      });
    }

    responseText =
      typeof body.admin_response === 'string' ? body.admin_response.trim() : null;

    updates.push('admin_response = ?');
    params.push(responseText);

    if (responseText === null) {
      updates.push('responded_at = NULL');
      updates.push('responded_by = NULL');
      updates.push('response_emailed_at = NULL');
    } else {
      updates.push('responded_at = unixepoch()');
      updates.push('responded_by = ?');
      params.push(admin.username || admin.id || 'admin');
    }
  }

  if (updates.length === 0 && !sendEmail) {
    throw createError({
      statusCode: 400,
      message:
        'No fields to update. Provide status, internal_notes, admin_response, and/or send_email.',
    });
  }

  if (updates.length > 0) {
    updates.push('updated_at = unixepoch()');
  }

  const db = getDB(event);

  try {
    const existing = await db
      .prepare('SELECT * FROM feedback_submissions WHERE id = ? LIMIT 1')
      .bind(id)
      .first<Record<string, any>>();

    if (!existing) {
      throw createError({ statusCode: 404, message: 'Feedback not found' });
    }

    if (updates.length > 0) {
      await db
        .prepare(`UPDATE feedback_submissions SET ${updates.join(', ')} WHERE id = ?`)
        .bind(...params, id)
        .run();
    }

    let emailSent = false;
    let emailError: string | null = null;

    if (sendEmail) {
      const latest = await db
        .prepare('SELECT * FROM feedback_submissions WHERE id = ? LIMIT 1')
        .bind(id)
        .first<Record<string, any>>();

      const replyText = responseText || latest?.admin_response;
      if (!replyText) {
        throw createError({
          statusCode: 400,
          message: 'admin_response is required when send_email is true',
        });
      }

      try {
        const result = await sendFeedbackReplyEmail(
          latest as any,
          replyText,
          event,
          { bypassQuota: body.ignore_quota !== false },
        );
        if (result.sent) {
          emailSent = true;
          await db
            .prepare(
              `UPDATE feedback_submissions
               SET response_emailed_at = unixepoch(), updated_at = unixepoch()
               WHERE id = ?`
            )
            .bind(id)
            .run();
        } else {
          emailError = result.reason || 'Email was not sent';
        }
      } catch (e: any) {
        emailError = e?.statusMessage || e?.message || 'Failed to send email';
      }
    }

    const row = await db
      .prepare('SELECT * FROM feedback_submissions WHERE id = ? LIMIT 1')
      .bind(id)
      .first<Record<string, any>>();

    return {
      ...mapFeedbackRow(row!, { includeUserAgent: true }),
      email_sent: emailSent,
      email_error: emailError,
    };
  } catch (e: any) {
    if (e.statusCode) throw e;
    throw createError({
      statusCode: 500,
      message: 'Failed to update feedback',
      cause: e,
    });
  }
});
