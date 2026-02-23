import { getDB } from '../../../utils/db';
import { requireAdmin } from '../../../utils/auth';

interface AdminThemeQuery {
  page?: string;
  limit?: string;
  status?: string;
  search?: string;
  type?: string; // 'betterseqta' | 'desqta' | omit for all
  category?: string;
  sort_by?: string; // 'created_at' | 'download_count' | 'rating_average' | 'name' | 'updated_at'
  sort_order?: string; // 'asc' | 'desc'
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const query = getQuery<AdminThemeQuery>(event);

  const page = parseInt(query.page || '1', 10);
  const limit = Math.min(parseInt(query.limit || '20', 10), 100);
  const offset = (page - 1) * limit;
  const status = query.status;
  const search = query.search;
  const type = query.type;
  const category = query.category;
  const sortBy = ['created_at', 'download_count', 'rating_average', 'name', 'updated_at'].includes(query.sort_by || '')
    ? query.sort_by
    : 'created_at';
  const sortOrder = query.sort_order === 'asc' ? 'ASC' : 'DESC';

  const params: any[] = [];
  const conditions: string[] = [];

  if (type === 'betterseqta' || type === 'desqta') {
    conditions.push('theme_type = ?');
    params.push(type);
  }

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (search) {
    conditions.push('(name LIKE ? OR description LIKE ? OR author LIKE ?)');
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await db.prepare(
    `SELECT COUNT(*) as total FROM themes ${whereClause}`
  ).bind(...params).first() as { total: number } | null;

  const total = countResult?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Get summary counts (total by status) - only when no filters to avoid extra queries when filtered
  let summary: { pending: number; approved: number; rejected: number } | undefined;
  if (conditions.length === 0) {
    const summaryResult = await db.prepare(
      `SELECT status, COUNT(*) as count FROM themes GROUP BY status`
    ).all() as { results: { status: string; count: number }[] };
    const byStatus = Object.fromEntries(
      (summaryResult.results || []).map((r: any) => [r.status, r.count])
    );
    summary = {
      pending: byStatus.pending || 0,
      approved: byStatus.approved || 0,
      rejected: byStatus.rejected || 0
    };
  }

  const orderColumn = sortBy === 'name' ? 't.name' : `t.${sortBy}`;
  const orderClause = `${orderColumn} ${sortOrder}`;

  // Get themes
  const themesResult = await db.prepare(
    `SELECT t.*, ts.submission_notes, ts.reviewed_by, ts.reviewed_at, ts.rejection_reason 
     FROM themes t
     LEFT JOIN theme_submissions ts ON t.id = ts.theme_id
     ${whereClause}
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all();

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
      thumbnail: theme.preview_thumbnail_url || theme.cover_image_url,
      screenshots: theme.preview_screenshots ? JSON.parse(theme.preview_screenshots) : []
    },
    preview_thumbnail_url: theme.preview_thumbnail_url || theme.cover_image_url,
    theme_type: theme.theme_type || 'desqta',
    zip_download_url: theme.zip_download_url,
    theme_json_url: theme.theme_json_url,
    cover_image_url: theme.cover_image_url,
    marquee_image_url: theme.marquee_image_url,
    file_size: theme.file_size,
    checksum: theme.checksum,
    created_at: theme.created_at,
    updated_at: theme.updated_at,
    published_at: theme.published_at,
    submission_notes: theme.submission_notes,
    reviewed_by: theme.reviewed_by,
    reviewed_at: theme.reviewed_at,
    rejection_reason: theme.rejection_reason
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
      },
      ...(summary && { summary })
    },
    error: null,
    meta: {
      timestamp: Date.now(),
      version: '1.0.0'
    }
  };
});
