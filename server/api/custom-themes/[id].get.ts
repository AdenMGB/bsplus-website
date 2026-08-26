import { getUserThemesDB } from '../../utils/userThemesDb';
import {
  createApiEnvelope,
  formatCustomThemePublic,
  getCustomThemeById
} from '../../utils/customThemes';

export default defineEventHandler(async (event) => {
  const db = getUserThemesDB(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  const theme = await getCustomThemeById(db, id, 'approved');
  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  return createApiEnvelope({
    theme: formatCustomThemePublic(theme as unknown as Record<string, unknown>)
  });
});
