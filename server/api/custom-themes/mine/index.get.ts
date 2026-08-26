import { requireAuth } from '../../../utils/auth';
import { getUserThemesDB } from '../../../utils/userThemesDb';
import {
  buildCustomThemeListQuery,
  createApiEnvelope,
  formatCustomThemeOwner,
  type CustomThemeStatus
} from '../../../utils/customThemes';

interface MineQuery {
  page?: string;
  limit?: string;
  status?: string;
  type?: string;
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const db = getUserThemesDB(event);
  const query = getQuery<MineQuery>(event);

  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.min(parseInt(query.limit || '20', 10), 100);

  const allowedStatuses: CustomThemeStatus[] = ['pending', 'approved', 'rejected'];
  const statusFilter =
    query.status && allowedStatuses.includes(query.status as CustomThemeStatus)
      ? (query.status as CustomThemeStatus)
      : undefined;

  const { whereClause, orderBy, bindings, offset, limit: pageLimit } =
    buildCustomThemeListQuery({
      authorId: user.id,
      status: statusFilter,
      themeType: query.type,
      sort: 'newest',
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

  const themes = (rows.results ?? []).map(formatCustomThemeOwner);

  return createApiEnvelope({
    themes,
    pagination: {
      page,
      limit: pageLimit,
      total,
      total_pages: Math.ceil(total / pageLimit)
    }
  });
});
