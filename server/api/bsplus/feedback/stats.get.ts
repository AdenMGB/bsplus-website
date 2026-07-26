/**
 * GET /api/bsplus/feedback/stats
 * Admin summary counts for feedback triage dashboard.
 */
import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';
import { FEEDBACK_STATUSES } from '../../../utils/feedback';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);

  try {
    const rows = await db
      .prepare(
        `SELECT status, COUNT(*) AS count
         FROM feedback_submissions
         GROUP BY status`
      )
      .all();

    const byStatus: Record<string, number> = {};
    for (const status of FEEDBACK_STATUSES) {
      byStatus[status] = 0;
    }

    let total = 0;
    for (const row of (rows.results || []) as { status: string; count: number }[]) {
      const count = Number(row.count) || 0;
      byStatus[row.status] = count;
      total += count;
    }

    const weekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    const recent = await db
      .prepare(
        `SELECT COUNT(*) AS count FROM feedback_submissions WHERE created_at >= ?`
      )
      .bind(weekAgo)
      .first<{ count: number }>();

    const unanswered = await db
      .prepare(
        `SELECT COUNT(*) AS count FROM feedback_submissions
         WHERE contact_included = 1
           AND contact_email IS NOT NULL
           AND admin_response IS NULL
           AND status NOT IN ('spam', 'wontfix', 'resolved')`
      )
      .first<{ count: number }>();

    return {
      total,
      by_status: byStatus,
      open:
        (byStatus.received || 0) +
        (byStatus.triaged || 0) +
        (byStatus.in_progress || 0),
      received: byStatus.received || 0,
      last_7_days: Number(recent?.count) || 0,
      awaiting_reply: Number(unanswered?.count) || 0,
    };
  } catch (e: any) {
    if (e.statusCode) throw e;
    throw createError({
      statusCode: 500,
      message: 'Failed to load feedback stats',
      cause: e,
    });
  }
});
