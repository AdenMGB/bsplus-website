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
    'SELECT zip_download_url, checksum, file_size FROM themes WHERE id = ? AND status = ?'
  ).bind(id, 'approved').first() as any;

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
