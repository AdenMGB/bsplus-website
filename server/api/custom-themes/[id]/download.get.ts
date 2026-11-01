import { getDB } from '../../../utils/db';
import {
  buildCustomThemeDownloadData,
  createApiEnvelope,
  resolveCustomThemeDownload
} from '../../../utils/customThemes';
import { maybeRecordThemeDownloadEvent } from '../../../utils/bsplusThemeAnalytics';

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

  const { theme, download_count } = await resolveCustomThemeDownload(db, id);
  maybeRecordThemeDownloadEvent(event, db, {
    query,
    themeId: id,
    themeSource: 'community',
    route: '/api/custom-themes/:id/download',
  });

  return createApiEnvelope(buildCustomThemeDownloadData(theme, download_count));
});
