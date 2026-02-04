import { getDB } from '../../../utils/db';
import { getOptionalUser } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const id = getRouterParam(event, 'id');
  const user = await getOptionalUser(event);

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

  // If user is not authenticated, return defaults
  if (!user) {
    return {
      success: true,
      data: {
        is_favorited: false,
        has_rated: false,
        rating: null
      },
      error: null,
      meta: {
        timestamp: Date.now(),
        version: '1.0.0'
      }
    };
  }

  // Check if favorited
  const favorite = await db.prepare(
    'SELECT id FROM user_favorites WHERE user_id = ? AND theme_id = ?'
  ).bind(user.id, id).first();

  // Check if rated
  const rating = await db.prepare(
    'SELECT id, rating, comment FROM theme_ratings WHERE user_id = ? AND theme_id = ?'
  ).bind(user.id, id).first() as { id: string; rating: number; comment: string | null } | null;

  return {
    success: true,
    data: {
      is_favorited: !!favorite,
      has_rated: !!rating,
      rating: rating ? {
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment
      } : null
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
