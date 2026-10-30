import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { ensureThemeSubmitterBadge } from '../../../../utils/accounts-badges';
import { createApiEnvelope, getCustomThemeById, nowUnixSeconds } from '../../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdmin(event);
  const db = getDB(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  const theme = await getCustomThemeById(db, id);
  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  const now = nowUnixSeconds();
  const authorId = typeof theme.author_id === 'string' ? theme.author_id : '';

  await db
    .prepare(
      "UPDATE custom_themes SET status = 'approved', published_at = ?, updated_at = ?, reviewed_by = ?, reviewed_at = ?, rejection_reason = NULL WHERE id = ?"
    )
    .bind(now, now, adminUser.id, now, id)
    .run();

  const badge = await ensureThemeSubmitterBadge(event, authorId);

  return createApiEnvelope({
    message: 'Custom theme approved successfully',
    id,
    status: 'approved',
    theme_submitter_badge: badge
  });
});
