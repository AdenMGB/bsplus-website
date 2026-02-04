import { getDB } from '../../utils/db';
import { getOptionalUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const user = await getOptionalUser(event);
  const query = getQuery<{ page?: string; limit?: string }>(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    });
  }

  const page = parseInt(query.page || '1', 10);
  const limit = Math.min(parseInt(query.limit || '20', 10), 100);
  const offset = (page - 1) * limit;

  // Get user's favorite theme IDs
  const favoritesResult = await db.prepare(
    'SELECT theme_id FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).bind(user.id, limit, offset).all() as { results: { theme_id: string }[] };

  const themeIds = favoritesResult.results.map((f: { theme_id: string }) => f.theme_id);

  if (themeIds.length === 0) {
    return {
      success: true,
      data: {
        themes: [],
        pagination: {
          page,
          limit,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false
        }
      },
      error: null,
      meta: {
        timestamp: Date.now(),
        version: '1.0.0'
      }
    };
  }

  // Get total count
  const countResult = await db.prepare(
    'SELECT COUNT(*) as total FROM user_favorites WHERE user_id = ?'
  ).bind(user.id).first() as { total: number } | null;

  const total = countResult?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Get themes
  const placeholders = themeIds.map(() => '?').join(',');
  const themesResult = await db.prepare(
    `SELECT * FROM themes WHERE id IN (${placeholders}) AND status = 'approved'`
  ).bind(...themeIds).all();

  const themes = themesResult.results.map((theme: any) => ({
    id: theme.id,
    name: theme.name,
    slug: theme.slug,
    version: theme.version,
    description: theme.description,
    author: theme.author,
    license: theme.license,
    category: theme.category,
    tags: theme.tags ? JSON.parse(theme.tags) : [],
    status: theme.status,
    featured: Boolean(theme.featured),
    download_count: theme.download_count,
    favorite_count: theme.favorite_count,
    rating_average: theme.rating_average,
    rating_count: theme.rating_count,
    compatibility: {
      min: theme.compatibility_min,
      max: theme.compatibility_max || undefined
    },
    preview: {
      thumbnail: theme.preview_thumbnail_url,
      screenshots: theme.preview_screenshots ? JSON.parse(theme.preview_screenshots) : []
    },
    created_at: theme.created_at,
    updated_at: theme.updated_at,
    published_at: theme.published_at,
    file_size: theme.file_size,
    is_favorited: true
  }));

  return {
    success: true,
    data: {
      themes,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
