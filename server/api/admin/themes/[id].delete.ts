import { getDB } from '../../../utils/db';
import { getBucket } from '../../../utils/r2';
import { requireAdmin } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const bucket = getBucket(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  // Get theme to find R2 keys
  const theme = await db.prepare(
    'SELECT zip_download_url, preview_thumbnail_url, preview_screenshots FROM themes WHERE id = ?'
  ).bind(id).first() as any;

  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  // Delete files from R2
  try {
    // Delete ZIP
    if (theme.zip_download_url) {
      const zipKey = theme.zip_download_url.replace('/api/images/', '');
      await bucket.delete(zipKey);
    }

    // Delete preview
    if (theme.preview_thumbnail_url) {
      const previewKey = theme.preview_thumbnail_url.replace('/api/images/', '');
      await bucket.delete(previewKey);
    }

    // Delete screenshots
    if (theme.preview_screenshots) {
      const screenshots = JSON.parse(theme.preview_screenshots) as string[];
      for (const screenshotUrl of screenshots) {
        const screenshotKey = screenshotUrl.replace('/api/images/', '');
        await bucket.delete(screenshotKey);
      }
    }
  } catch (error) {
    // Log error but continue with database deletion
    console.error('Error deleting R2 files:', error);
  }

  // Delete from database (cascades will handle related records)
  await db.prepare('DELETE FROM themes WHERE id = ?').bind(id).run();

  return {
    success: true,
    data: {
      message: 'Theme deleted successfully'
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
