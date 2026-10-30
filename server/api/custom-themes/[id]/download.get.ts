import { getDB } from '../../../utils/db';
import {
  buildCustomThemeDownloadData,
  createApiEnvelope,
  resolveCustomThemeDownload
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

  const { theme, download_count } = await resolveCustomThemeDownload(db, id);

  return createApiEnvelope(buildCustomThemeDownloadData(theme, download_count));
});
