import { getUserThemesDB } from '../../../utils/userThemesDb';
import {
  createApiEnvelope,
  formatCustomThemePublic
} from '../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  const db = getUserThemesDB(event);
  const slug = getRouterParam(event, 'slug');

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    });
  }

  const theme = await db
    .prepare("SELECT * FROM custom_themes WHERE slug = ? AND status = 'approved'")
    .bind(slug)
    .first<Record<string, unknown>>();

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
