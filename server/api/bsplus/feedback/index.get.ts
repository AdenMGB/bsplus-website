/**
 * GET /api/bsplus/feedback
 * Admin triage list for BetterSEQTA+ extension feedback.
 */
import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  mapFeedbackRow,
  type FeedbackCategory,
  type FeedbackStatus,
} from '../../../utils/feedback';

interface FeedbackListQuery {
  status?: string;
  category?: string;
  installId?: string;
  from?: string;
  to?: string;
  q?: string;
  cursor?: string;
  limit?: string;
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const query = getQuery<FeedbackListQuery>(event);

  const limit = Math.min(Math.max(parseInt(query.limit || '20', 10) || 20, 1), 100);
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (query.status) {
    if (!FEEDBACK_STATUSES.includes(query.status as FeedbackStatus)) {
      throw createError({
        statusCode: 400,
        message: `status must be one of: ${FEEDBACK_STATUSES.join(', ')}`,
      });
    }
    conditions.push('status = ?');
    params.push(query.status);
  }

  if (query.category) {
    if (!FEEDBACK_CATEGORIES.includes(query.category as FeedbackCategory)) {
      throw createError({
        statusCode: 400,
        message: `category must be one of: ${FEEDBACK_CATEGORIES.join(', ')}`,
      });
    }
    conditions.push('category = ?');
    params.push(query.category);
  }

  if (query.installId) {
    conditions.push('install_id = ?');
    params.push(query.installId.trim().toLowerCase());
  }

  if (query.from) {
    const fromMs = Date.parse(query.from);
    if (Number.isNaN(fromMs)) {
      throw createError({ statusCode: 400, message: 'from must be a valid ISO 8601 timestamp' });
    }
    conditions.push('created_at >= ?');
    params.push(Math.floor(fromMs / 1000));
  }

  if (query.to) {
    const toMs = Date.parse(query.to);
    if (Number.isNaN(toMs)) {
      throw createError({ statusCode: 400, message: 'to must be a valid ISO 8601 timestamp' });
    }
    conditions.push('created_at <= ?');
    params.push(Math.floor(toMs / 1000));
  }

  if (query.q) {
    const needle = `%${query.q.trim()}%`;
    conditions.push('(subject LIKE ? OR message LIKE ?)');
    params.push(needle, needle);
  }

  if (query.cursor) {
    const cursorMs = Date.parse(query.cursor);
    if (Number.isNaN(cursorMs)) {
      throw createError({
        statusCode: 400,
        message: 'cursor must be a valid ISO 8601 timestamp (created_at of last item)',
      });
    }
    conditions.push('created_at < ?');
    params.push(Math.floor(cursorMs / 1000));
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const rows = await db
      .prepare(
        `SELECT * FROM feedback_submissions
         ${where}
         ORDER BY created_at DESC
         LIMIT ?`
      )
      .bind(...params, limit + 1)
      .all();

    const results = (rows.results || []) as Record<string, any>[];
    const hasMore = results.length > limit;
    const items = results.slice(0, limit).map((row) => mapFeedbackRow(row));
    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1]!.created_at : null;

    return {
      items,
      next_cursor: nextCursor,
      limit,
    };
  } catch (e: any) {
    if (e.statusCode) throw e;
    throw createError({
      statusCode: 500,
      message: 'Failed to list feedback',
      cause: e,
    });
  }
});
