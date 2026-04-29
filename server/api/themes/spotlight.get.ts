import { getDB } from '../../utils/db';
import { getOptionalUser } from '../../utils/auth';
import {
  type ThemeFlavourEntry,
  loadFlavoursForMasters,
  betterseqtaThemeRole
} from '../../utils/themeFlavours';

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const user = await getOptionalUser(event);

  // Get featured themes
  const themesResult = await db.prepare(
    `SELECT * FROM themes 
     WHERE status = 'approved' AND featured = 1 AND (flavour_master_id IS NULL)
     ORDER BY (download_count * 2 + favorite_count + rating_count) DESC 
     LIMIT 20`
  ).all();

  // Get user favorites and ratings if authenticated
  let favoriteThemeIds: Set<string> = new Set();
  let userRatings: Map<string, { rating: number; comment: string | null }> = new Map();
  
  if (user) {
    // Get all user favorites
    const favoritesResult = await db.prepare(
      'SELECT theme_id FROM user_favorites WHERE user_id = ?'
    ).bind(user.id).all() as { results: { theme_id: string }[] };
    favoriteThemeIds = new Set(favoritesResult.results.map((f: { theme_id: string }) => f.theme_id));
    
    // Get all user ratings for themes in this result set
    const themeIds = themesResult.results.map((t: any) => t.id);
    if (themeIds.length > 0) {
      const placeholders = themeIds.map(() => '?').join(',');
      const ratingsResult = await db.prepare(
        `SELECT theme_id, rating, comment FROM theme_ratings WHERE user_id = ? AND theme_id IN (${placeholders})`
      ).bind(user.id, ...themeIds).all() as { results: { theme_id: string; rating: number; comment: string | null }[] };
      
      ratingsResult.results.forEach((r: { theme_id: string; rating: number; comment: string | null }) => {
        userRatings.set(r.theme_id, { rating: r.rating, comment: r.comment });
      });
    }
  }

  const rows = themesResult.results as Record<string, unknown>[];
  const bsMasterIds = rows
    .filter((t) => t.theme_type === 'betterseqta' && !t.flavour_master_id)
    .map((t) => t.id as string);
  const flavoursByMaster = await loadFlavoursForMasters(db, bsMasterIds);

  const themes = rows.map((theme: Record<string, unknown>) => {
    const userRating = userRatings.get(theme.id as string);
    const base = {
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      version: theme.version,
      description: theme.description,
      author: theme.author,
      license: theme.license,
      category: theme.category,
      tags: theme.tags ? JSON.parse(theme.tags as string) : [],
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
        screenshots: theme.preview_screenshots ? JSON.parse(theme.preview_screenshots as string) : []
      },
      created_at: theme.created_at,
      updated_at: theme.updated_at,
      published_at: theme.published_at,
      file_size: theme.file_size,
      is_favorited: favoriteThemeIds.has(theme.id as string),
      user_rating: userRating || null
    };

    if (theme.theme_type === 'betterseqta') {
      const fList: ThemeFlavourEntry[] =
        flavoursByMaster.get(theme.id as string) ?? [];
      return {
        ...base,
        theme_type: 'betterseqta',
        coverImage: theme.cover_image_url,
        marqueeImage: theme.marquee_image_url,
        theme_json_url: theme.theme_json_url,
        is_pseudo_theme: Boolean(theme.is_pseudo_theme),
        theme_role: betterseqtaThemeRole(theme, fList),
        ...(fList.length > 0 ? { flavours: fList } : {})
      };
    }

    return { ...base, theme_type: theme.theme_type || 'desqta' };
  });

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
