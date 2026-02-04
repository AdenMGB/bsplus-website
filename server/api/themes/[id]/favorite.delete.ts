import { getDB } from '../../../utils/db';
import { getOptionalUser } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const id = getRouterParam(event, 'id');
  const user = await getOptionalUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    });
  }

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  // Remove favorite
  const result = await db.prepare(
    'DELETE FROM user_favorites WHERE user_id = ? AND theme_id = ?'
  ).bind(user.id, id).run();

  if (result.meta.changes > 0) {
    // Update favorite count (ensure it doesn't go below 0)
    await db.prepare(
      'UPDATE themes SET favorite_count = CASE WHEN favorite_count > 0 THEN favorite_count - 1 ELSE 0 END WHERE id = ?'
    ).bind(id).run();
  }

  // Get updated count
  const updatedTheme = await db.prepare(
    'SELECT favorite_count FROM themes WHERE id = ?'
  ).bind(id).first() as { favorite_count: number } | null;

  return {
    success: true,
    data: {
      favorited: false,
      favorite_count: updatedTheme?.favorite_count || 0
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
