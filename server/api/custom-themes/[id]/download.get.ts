import { getUserThemesDB } from '../../../utils/userThemesDb';
import { createApiEnvelope, getCustomThemeById } from '../../../utils/customThemes';

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

  await db
    .prepare('UPDATE custom_themes SET download_count = download_count + 1 WHERE id = ?')
    .bind(id)
    .run();

  const newCount = (theme.download_count ?? 0) + 1;

  if (theme.theme_type === 'betterseqta') {
    return createApiEnvelope({
      theme_json_url: theme.theme_json_url,
      download_count: newCount
    });
  }

  return createApiEnvelope({
    zip_download_url: theme.zip_download_url,
    checksum: theme.checksum,
    file_size: theme.file_size,
    download_count: newCount
  });
});
