/**
 * GET /api/bsplus/feedback/:id
 * Admin triage detail for a single feedback submission.
 */
import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';
import { mapFeedbackRow } from '../../../utils/feedback';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, message: 'Feedback id is required' });
  }

  const db = getDB(event);

  try {
    const row = await db
      .prepare('SELECT * FROM feedback_submissions WHERE id = ? LIMIT 1')
      .bind(id)
      .first<Record<string, any>>();

    if (!row) {
      throw createError({ statusCode: 404, message: 'Feedback not found' });
    }

    return mapFeedbackRow(row, { includeUserAgent: true });
  } catch (e: any) {
    if (e.statusCode) throw e;
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch feedback',
      cause: e,
    });
  }
});
