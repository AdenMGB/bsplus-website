import { getDB } from '../../utils/db';
import { getOptionalUser } from '../../utils/auth';

interface ThemeQuery {
  page?: string;
  limit?: string;
  category?: string;
  tags?: string;
  search?: string;
  sort?: string;
  featured?: string;
  min_rating?: string;
  compatible_version?: string;
}

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const query = getQuery<ThemeQuery>(event);
  const user = await getOptionalUser(event);

  // Parse query parameters
  const page = parseInt(query.page || '1', 10);
  const limit = Math.min(parseInt(query.limit || '20', 10), 100);
  const offset = (page - 1) * limit;
  const sort = query.sort || 'popular';
  const category = query.category;
  const tags = query.tags?.split(',').map(t => t.trim()).filter(Boolean);
  const search = query.search;
  const featured = query.featured === 'true';
  const minRating = query.min_rating ? parseFloat(query.min_rating) : undefined;
  const compatibleVersion = query.compatible_version;

  // Build WHERE clause
  const conditions: string[] = ["status = 'approved'"];
  const params: any[] = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (featured) {
    conditions.push('featured = 1');
  }

  if (minRating !== undefined) {
    conditions.push('rating_average >= ?');
    params.push(minRating);
  }

  if (compatibleVersion) {
    // Simple version comparison - in production, use semantic version comparison
    conditions.push('compatibility_min <= ?');
    params.push(compatibleVersion);
  }

  if (search) {
    conditions.push('(name LIKE ? OR description LIKE ? OR author LIKE ?)');
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  if (tags && tags.length > 0) {
    // Check if tags JSON contains any of the requested tags
    const tagConditions = tags.map(() => 'tags LIKE ?').join(' OR ');
    conditions.push(`(${tagConditions})`);
    tags.forEach(tag => params.push(`%"${tag}"%`));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Build ORDER BY clause
  let orderBy = 'ORDER BY ';
  switch (sort) {
    case 'newest':
      orderBy += 'created_at DESC';
      break;
    case 'rating':
      orderBy += 'rating_average DESC, rating_count DESC';
      break;
    case 'downloads':
      orderBy += 'download_count DESC';
      break;
    case 'name':
      orderBy += 'name ASC';
      break;
    case 'popular':
    default:
      orderBy += '(download_count * 2 + favorite_count + rating_count) DESC';
      break;
  }

  // Get total count
  const countResult = await db.prepare(
    `SELECT COUNT(*) as total FROM themes ${whereClause}`
  ).bind(...params).first() as { total: number } | null;

  const total = countResult?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Get themes
  const themesResult = await db.prepare(
    `SELECT * FROM themes ${whereClause} ${orderBy} LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all();

  // Get user favorites if authenticated
  let favoriteThemeIds: Set<string> = new Set();
  if (user) {
    const favoritesResult = await db.prepare(
      'SELECT theme_id FROM user_favorites WHERE user_id = ?'
    ).bind(user.id).all() as { results: { theme_id: string }[] };
    favoriteThemeIds = new Set(favoritesResult.results.map((f: { theme_id: string }) => f.theme_id));
  }

  // Format themes
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
