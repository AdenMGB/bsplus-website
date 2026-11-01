import { getDB } from '../../utils/db';
import {
  createApiEnvelope,
  formatCustomThemePublic,
  getCustomThemeById
} from '../../utils/customThemes';
import { maybeRecordThemeCatalogEvent } from '../../utils/bsplusThemeAnalytics';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const id = getRouterParam(event, 'id');
  const query = getQuery(event) as Record<string, unknown>;

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

  maybeRecordThemeCatalogEvent(event, db, {
    query,
    eventType: 'detail',
    themeId: id,
    route: '/api/custom-themes/:id',
  });

  return createApiEnvelope({
    theme: formatCustomThemePublic(theme as unknown as Record<string, unknown>)
  });
});
