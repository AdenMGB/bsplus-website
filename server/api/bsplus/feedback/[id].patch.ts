/**
 * PATCH /api/bsplus/feedback/:id
 * Admin triage update (status / notes / response).
 */
import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';
import {
  FEEDBACK_STATUSES,
  mapFeedbackRow,
  type FeedbackStatus,
} from '../../../utils/feedback';

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

    updates.push('admin_response = ?');
    params.push(
      typeof body.admin_response === 'string' ? body.admin_response.trim() : null
    );

    if (body.admin_response === null) {
      updates.push('responded_at = NULL');
      updates.push('responded_by = NULL');
    } else {
      updates.push('responded_at = unixepoch()');
      updates.push('responded_by = ?');
      params.push(admin.username || admin.id || 'admin');
    }
  }

  if (updates.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No fields to update. Provide status, internal_notes, and/or admin_response.',
    });
  }

  updates.push('updated_at = unixepoch()');
  const db = getDB(event);

  try {
    const existing = await db
      .prepare('SELECT id FROM feedback_submissions WHERE id = ? LIMIT 1')
      .bind(id)
      .first();

    if (!existing) {
      throw createError({ statusCode: 404, message: 'Feedback not found' });
    }

    await db
      .prepare(`UPDATE feedback_submissions SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...params, id)
      .run();

    const row = await db
      .prepare('SELECT * FROM feedback_submissions WHERE id = ? LIMIT 1')
      .bind(id)
      .first<Record<string, any>>();

    return mapFeedbackRow(row!, { includeUserAgent: true });
  } catch (e: any) {
    if (e.statusCode) throw e;
    throw createError({
      statusCode: 500,
      message: 'Failed to update feedback',
      cause: e,
    });
  }
});
