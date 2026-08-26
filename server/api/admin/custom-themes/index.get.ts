import { requireAdmin } from '../../../utils/auth';
import { getUserThemesDB } from '../../../utils/userThemesDb';
import {
  createApiEnvelope,
  formatCustomThemeOwner,
  getCustomThemeStatusCounts,
  listCustomThemes,
  type CustomThemeStatus
} from '../../../utils/customThemes';

interface AdminQuery {
  page?: string;
  limit?: string;
  status?: string;
  author_id?: string;
  search?: string;
  type?: string;
  include_counts?: string;
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getUserThemesDB(event);
  const query = getQuery<AdminQuery>(event);

  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.min(parseInt(query.limit || '20', 10), 100);

  const allowedStatuses: CustomThemeStatus[] = ['pending', 'approved', 'rejected'];
  const statusFilter =
    query.status && allowedStatuses.includes(query.status as CustomThemeStatus)
      ? (query.status as CustomThemeStatus)
      : undefined;

  const listed = await listCustomThemes(
    db,
    {
      status: statusFilter,
      authorId: query.author_id,
      themeType: query.type,
      search: query.search,
      sort: 'newest',
      page,
      limit
    },
    formatCustomThemeOwner
  );

  const includeCounts = ['1', 'true', 'yes'].includes((query.include_counts ?? '').toLowerCase());
  const data: Record<string, unknown> = { ...listed };
  if (includeCounts) {
    data.counts = await getCustomThemeStatusCounts(db);
  }

  return createApiEnvelope(data);
});
