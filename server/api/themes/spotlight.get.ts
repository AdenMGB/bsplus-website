import { getDB } from '../../utils/db';
import { getOptionalUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const user = await getOptionalUser(event);

  // Get featured themes
  const themesResult = await db.prepare(
    `SELECT * FROM themes 
     WHERE status = 'approved' AND featured = 1 
     ORDER BY (download_count * 2 + favorite_count + rating_count) DESC 
     LIMIT 20`
  ).all();

  // Get user favorites if authenticated
  let favoriteThemeIds: Set<string> = new Set();
  if (user) {
    const favoritesResult = await db.prepare(
      'SELECT theme_id FROM user_favorites WHERE user_id = ?'
    ).bind(user.id).all() as { results: { theme_id: string }[] };
    favoriteThemeIds = new Set(favoritesResult.results.map((f: { theme_id: string }) => f.theme_id));
  }

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
    is_favorited: favoriteThemeIds.has(theme.id)
  }));

  return {
    success: true,
    data: {
      themes
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
