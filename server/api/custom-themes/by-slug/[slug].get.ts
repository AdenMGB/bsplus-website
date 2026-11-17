import { getDB } from '../../../utils/db';
import {
  createApiEnvelope,
  formatCustomThemePublic
} from '../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const slug = getRouterParam(event, 'slug');

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    });
  }

  let theme = await db
    .prepare(
      "SELECT * FROM custom_themes WHERE slug = ? AND status = 'approved' AND is_current_version = 1"
    )
    .bind(slug)
    .first<Record<string, unknown>>();

  if (!theme) {
    const legacy = await db
      .prepare("SELECT * FROM custom_themes WHERE slug = ? AND status = 'approved'")
      .bind(slug)
      .first<Record<string, unknown>>();
    if (legacy?.version_group_id) {
      theme = await db
        .prepare(
          `SELECT * FROM custom_themes
           WHERE version_group_id = ? AND status = 'approved' AND is_current_version = 1`
        )
        .bind(legacy.version_group_id)
        .first<Record<string, unknown>>();
    } else {
      theme = legacy;
    }
  }

  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  return createApiEnvelope({
    theme: formatCustomThemePublic(theme)
  });
});
