import { getDB } from '../../../utils/db';
import { getOptionalUser } from '../../../utils/auth';

interface RatingBody {
  rating: number;
  comment?: string;
}

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const id = getRouterParam(event, 'id');
  const user = await getOptionalUser(event);
  const body = await readBody<RatingBody>(event);

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

  if (!body.rating || body.rating < 1 || body.rating > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rating must be between 1 and 5'
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

  // Check if rating already exists
  const existingRating = await db.prepare(
    'SELECT id, rating FROM theme_ratings WHERE user_id = ? AND theme_id = ?'
  ).bind(user.id, id).first() as { id: string; rating: number } | null;

  const now = Date.now();
  let ratingId: string;

  if (existingRating) {
    // Update existing rating
    ratingId = existingRating.id;
    await db.prepare(
      'UPDATE theme_ratings SET rating = ?, comment = ?, updated_at = ? WHERE id = ?'
    ).bind(body.rating, body.comment || null, now, ratingId).run();

    // Update theme rating average (recalculate)
    const oldRating = existingRating.rating;
    const ratingsResult = await db.prepare(
      'SELECT AVG(rating) as avg, COUNT(*) as count FROM theme_ratings WHERE theme_id = ?'
    ).bind(id).first() as { avg: number; count: number } | null;

    await db.prepare(
      'UPDATE themes SET rating_average = ?, rating_count = ? WHERE id = ?'
    ).bind(ratingsResult?.avg || 0, ratingsResult?.count || 0, id).run();
  } else {
    // Create new rating
    ratingId = crypto.randomUUID();
    await db.prepare(
      'INSERT INTO theme_ratings (id, user_id, theme_id, rating, comment, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(ratingId, user.id, id, body.rating, body.comment || null, now, now).run();

    // Update theme rating average
    const ratingsResult = await db.prepare(
      'SELECT AVG(rating) as avg, COUNT(*) as count FROM theme_ratings WHERE theme_id = ?'
    ).bind(id).first() as { avg: number; count: number } | null;

    await db.prepare(
      'UPDATE themes SET rating_average = ?, rating_count = ? WHERE id = ?'
    ).bind(ratingsResult?.avg || 0, ratingsResult?.count || 0, id).run();
  }

  // Get updated theme rating
  const updatedTheme = await db.prepare(
    'SELECT rating_average, rating_count FROM themes WHERE id = ?'
  ).bind(id).first() as { rating_average: number; rating_count: number } | null;

  return {
    success: true,
    data: {
      rating: {
        id: ratingId,
        rating: body.rating,
        comment: body.comment || null,
        created_at: now
      },
      theme_rating_average: updatedTheme?.rating_average || 0,
      theme_rating_count: updatedTheme?.rating_count || 0
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
