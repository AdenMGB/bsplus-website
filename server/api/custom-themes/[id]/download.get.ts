import { getDB } from '../../../utils/db';
import {
  buildCustomThemeDownloadData,
  createApiEnvelope,
  recordCustomThemeDownload
} from '../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  const { theme, download_count } = await recordCustomThemeDownload(db, id);

  return createApiEnvelope(buildCustomThemeDownloadData(theme, download_count));
});
