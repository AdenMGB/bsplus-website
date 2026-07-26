/**
 * GET /api/bsplus/feedback/status
 *
 * Public client endpoint: check feedback status / admin response by installId.
 * Auth: none. Access is gated by knowing the anonymous install UUID.
 *
 * Query:
 *   - installId (required, UUID)
 *   - id (optional, feedback id) — when set, returns a single item
 *   - limit (optional, 1–20, default 10) — when listing by installId only
 */
import { getDB } from '../../../utils/db';
import {
  isValidInstallId,
  mapPublicFeedbackStatus,
  sendFeedbackError,
} from '../../../utils/feedback';

const FEEDBACK_ID_RE = /^fb_[0-9A-HJKMNP-TV-Z]{26}$/i;

interface StatusQuery {
  installId?: string;
  id?: string;
  limit?: string;
}

export default defineEventHandler(async (event) => {
  const query = getQuery<StatusQuery>(event);
  const installIdRaw = typeof query.installId === 'string' ? query.installId.trim() : '';

  if (!isValidInstallId(installIdRaw)) {
    return sendFeedbackError(
      event,
      422,
      'installId is required and must be a valid RFC 4122 UUID',
      'VALIDATION_ERROR'
    );
  }

  const installId = installIdRaw.toLowerCase();
  const feedbackId = typeof query.id === 'string' ? query.id.trim() : '';
  const db = getDB(event);

  try {
    if (feedbackId) {
      if (!FEEDBACK_ID_RE.test(feedbackId)) {
        return sendFeedbackError(
          event,
          422,
          'id must be a valid feedback reference (fb_…)',
          'VALIDATION_ERROR'
        );
      }

      const row = await db
        .prepare(
          `SELECT id, status, category, subject, admin_response, responded_at,
                  created_at, updated_at
           FROM feedback_submissions
           WHERE id = ? AND install_id = ?
           LIMIT 1`
        )
        .bind(feedbackId, installId)
        .first<Record<string, any>>();

      if (!row) {
        // Same response whether missing or wrong install — avoid leaking ownership.
        throw createError({
          statusCode: 404,
          message: 'Feedback not found',
          data: { error: 'Feedback not found', code: 'NOT_FOUND' },
        });
      }

      return mapPublicFeedbackStatus(row);
    }

    const limit = Math.min(Math.max(parseInt(query.limit || '10', 10) || 10, 1), 20);

    const rows = await db
      .prepare(
        `SELECT id, status, category, subject, admin_response, responded_at,
                created_at, updated_at
         FROM feedback_submissions
         WHERE install_id = ?
         ORDER BY created_at DESC
         LIMIT ?`
      )
      .bind(installId, limit)
      .all();

    const items = ((rows.results || []) as Record<string, any>[]).map(mapPublicFeedbackStatus);

    return {
      install_id: installId,
      items,
      count: items.length,
    };
  } catch (e: any) {
    if (e.statusCode) throw e;
    console.error('[Feedback] Failed to load status');
    throw createError({
      statusCode: 500,
      message: 'Failed to load feedback status',
      data: { error: 'Failed to load feedback status', code: 'INTERNAL_ERROR' },
      cause: e,
    });
  }
});
