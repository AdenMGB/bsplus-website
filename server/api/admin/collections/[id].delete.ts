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
      statusMessage: 'Collection ID is required'
    });
  }

  const collection = await db.prepare(
    'SELECT cover_image_url FROM collections WHERE id = ?'
  ).bind(id).first() as any;

  if (!collection) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Collection not found'
    });
  }

  // Delete cover image from R2 if exists
  if (collection.cover_image_url) {
    try {
      const coverKey = collection.cover_image_url.replace('/api/images/', '');
      await bucket.delete(coverKey);
    } catch (error) {
      console.error('Error deleting cover image:', error);
    }
  }

  // Delete collection
  await db.prepare('DELETE FROM collections WHERE id = ?').bind(id).run();

  return {
    success: true,
    data: {
      message: 'Collection deleted successfully'
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
