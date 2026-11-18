import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { notifyCustomThemeApproved } from '../../../../utils/custom-theme-approval-mail';
import { createApiEnvelope, getCustomThemeById } from '../../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
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

  if (theme.status !== 'approved') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Approval email can only be sent for approved themes'
    });
  }

  const force =
    getQuery(event).force === '1' ||
    getQuery(event).force === 'true';

  if (
    !force &&
    theme.approval_emailed_at != null &&
    Number(theme.approval_emailed_at) > 0
  ) {
    return createApiEnvelope({
      message: 'Approval email was already sent',
      already_sent: true,
      approval_emailed_at: Number(theme.approval_emailed_at),
    });
  }

  if (force) {
    await db
      .prepare('UPDATE custom_themes SET approval_emailed_at = NULL WHERE id = ?')
      .bind(id)
      .run()
      .catch(() => undefined);
  }

  const result = await notifyCustomThemeApproved(event, id, null);

  if (!result.sent) {
    throw createError({
      statusCode: result.reason?.includes('not configured') ? 503 : 502,
      statusMessage: result.reason || 'Failed to send approval email'
    });
  }

  const updated = await getCustomThemeById(db, id);

  return createApiEnvelope({
    message: 'Approval email sent',
    approval_email: result,
    approval_emailed_at: updated?.approval_emailed_at ?? null
  });
});