import { getDB } from '../../utils/db';
import { getOptionalUser } from '../../utils/auth';

interface SearchQuery {
  q: string;
  filters?: string; // JSON string
  page?: string;
  limit?: string;
  sort?: string;
}

interface SearchFilters {
  categories?: string[];
  tags?: string[];
  features?: string[];
  min_rating?: number;
  compatible_version?: string;
}

export default defineEventHandler(async (event) => {
  const db = getDB(event);
  const query = getQuery<SearchQuery>(event);
  const user = await getOptionalUser(event);

  if (!query.q) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Search query (q) is required'
    });
  }

  const page = parseInt(query.page || '1', 10);
  const limit = Math.min(parseInt(query.limit || '20', 10), 100);
  const offset = (page - 1) * limit;
  const sort = query.sort || 'popular';

  // Parse filters
  let filters: SearchFilters = {};
  if (query.filters) {
    try {
      filters = JSON.parse(query.filters) as SearchFilters;
    } catch {
      // Invalid JSON, ignore filters
    }
  }

  // Build WHERE clause
  const conditions: string[] = ["status = 'approved'"];
  const params: any[] = [];

  // Search query
  const searchPattern = `%${query.q}%`;
  conditions.push('(name LIKE ? OR description LIKE ? OR author LIKE ?)');
  params.push(searchPattern, searchPattern, searchPattern);

  // Apply filters
  if (filters.categories && filters.categories.length > 0) {
    const categoryPlaceholders = filters.categories.map(() => '?').join(',');
    conditions.push(`category IN (${categoryPlaceholders})`);
    params.push(...filters.categories);
  }

  if (filters.tags && filters.tags.length > 0) {
    const tagConditions = filters.tags.map(() => 'tags LIKE ?').join(' OR ');
    conditions.push(`(${tagConditions})`);
    filters.tags.forEach(tag => params.push(`%"${tag}"%`));
  }

  if (filters.min_rating !== undefined) {
    conditions.push('rating_average >= ?');
    params.push(filters.min_rating);
  }

  if (filters.compatible_version) {
    conditions.push('compatibility_min <= ?');
    params.push(filters.compatible_version);
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
