import { requireAdmin } from '../../../../utils/auth';
import { getUserThemesDB } from '../../../../utils/userThemesDb';
import { createApiEnvelope, getCustomThemeById, nowUnixSeconds } from '../../../../utils/customThemes';

interface RejectBody {
  reason: string;
}

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdmin(event);
  const db = getUserThemesDB(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody<RejectBody>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  if (!body.reason?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rejection reason is required'
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

  await db
    .prepare(
      "UPDATE custom_themes SET status = 'rejected', updated_at = ?, reviewed_by = ?, reviewed_at = ?, rejection_reason = ? WHERE id = ?"
    )
    .bind(now, adminUser.id, now, body.reason.trim(), id)
    .run();

  return createApiEnvelope({
    message: 'Custom theme rejected',
    id,
    status: 'rejected',
    rejection_reason: body.reason.trim()
  });
});
