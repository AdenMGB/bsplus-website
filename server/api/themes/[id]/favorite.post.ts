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

  // Check if theme exists and is approved
  const theme = await db.prepare(
    'SELECT id FROM themes WHERE id = ? AND status = ?'
  ).bind(id, 'approved').first();

  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  // Check if already favorited
  const existing = await db.prepare(
    'SELECT id FROM user_favorites WHERE user_id = ? AND theme_id = ?'
  ).bind(user.id, id).first();

  if (existing) {
    return {
      success: true,
      data: {
        favorited: true,
        favorite_count: 0 // Will be updated below
      },
      error: null,
      meta: {
        timestamp: Date.now(),
        version: '1.0.0'
      }
    };
  }

  // Add favorite
  const favoriteId = crypto.randomUUID();
  await db.prepare(
    'INSERT INTO user_favorites (id, user_id, theme_id, created_at) VALUES (?, ?, ?, ?)'
  ).bind(favoriteId, user.id, id, Date.now()).run();

  // Update favorite count
  await db.prepare(
    'UPDATE themes SET favorite_count = favorite_count + 1 WHERE id = ?'
  ).bind(id).run();

  // Get updated count
  const updatedTheme = await db.prepare(
    'SELECT favorite_count FROM themes WHERE id = ?'
  ).bind(id).first() as { favorite_count: number } | null;

  return {
    success: true,
    data: {
      favorited: true,
      favorite_count: updatedTheme?.favorite_count || 0
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
