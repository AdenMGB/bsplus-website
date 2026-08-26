import { getUserThemesDB } from '../../utils/userThemesDb';
import {
  buildCustomThemeListQuery,
  createApiEnvelope,
  formatCustomThemePublic
} from '../../utils/customThemes';

interface SearchQuery {
  q?: string;
  page?: string;
  limit?: string;
  type?: string;
  sort?: string;
}

export default defineEventHandler(async (event) => {
  const db = getUserThemesDB(event);
  const query = getQuery<SearchQuery>(event);

  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.min(parseInt(query.limit || '20', 10), 100);

  const { whereClause, orderBy, bindings, offset, limit: pageLimit } =
    buildCustomThemeListQuery({
      status: 'approved',
      themeType: query.type,
      search: query.q,
      sort: query.sort || 'popular',
      page,
      limit
    });

  const countRow = await db
    .prepare(`SELECT COUNT(*) as total FROM custom_themes ${whereClause}`)
    .bind(...bindings)
    .first<{ total: number }>();

  const total = countRow?.total ?? 0;

  const rows = await db
    .prepare(
      `SELECT * FROM custom_themes ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
    )
    .bind(...bindings, pageLimit, offset)
    .all<Record<string, unknown>>();

  const themes = (rows.results ?? []).map(formatCustomThemePublic);

  return createApiEnvelope({
    themes,
    query: query.q ?? '',
    pagination: {
      page,
      limit: pageLimit,
      total,
      total_pages: Math.ceil(total / pageLimit)
    }
  });
});
