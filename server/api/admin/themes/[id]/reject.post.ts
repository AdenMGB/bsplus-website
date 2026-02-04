import { getDB } from '../../../../utils/db';
import { requireAdmin } from '../../../../utils/auth';

interface RejectBody {
  reason: string;
}

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdmin(event);
  const db = getDB(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody<RejectBody>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  if (!body.reason) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rejection reason is required'
    });
  }

  // Check if theme exists
  const theme = await db.prepare(
    'SELECT id, status FROM themes WHERE id = ?'
  ).bind(id).first() as any;

  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  const now = Date.now();

  // Update theme status
  await db.prepare(
    'UPDATE themes SET status = ?, updated_at = ? WHERE id = ?'
  ).bind('rejected', now, id).run();

  // Update submission record
  await db.prepare(
    `UPDATE theme_submissions 
     SET status = ?, reviewed_by = ?, reviewed_at = ?, rejection_reason = ?
     WHERE theme_id = ?`
  ).bind('rejected', adminUser.id, now, body.reason, id).run();

  return {
    success: true,
    data: {
      message: 'Theme rejected successfully'
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
