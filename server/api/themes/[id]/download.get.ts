import { getDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  const theme = await db.prepare(
    'SELECT theme_type, zip_download_url, theme_json_url, checksum, file_size, download_count FROM themes WHERE id = ? AND status = ?'
  ).bind(id, 'approved').first() as { theme_type?: string; zip_download_url?: string; theme_json_url?: string; checksum?: string; file_size?: number; download_count?: number } | undefined;

  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  // Increment download count
  await db.prepare(
    'UPDATE themes SET download_count = download_count + 1 WHERE id = ?'
  ).bind(id).run();

  const newCount = (theme.download_count ?? 0) + 1;

  if (theme.theme_type === 'betterseqta') {
    return {
      success: true,
      data: {
        theme_json_url: theme.theme_json_url,
        download_count: newCount
      },
      error: null,
      meta: { timestamp: Date.now(), version: '1.0.0' }
    };
  }

  return {
    success: true,
    data: {
      zip_download_url: theme.zip_download_url,
      checksum: theme.checksum,
      file_size: theme.file_size
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
