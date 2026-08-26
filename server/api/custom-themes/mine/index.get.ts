import { requireAuth } from '../../../utils/auth';
import { getUserThemesDB } from '../../../utils/userThemesDb';
import {
  createApiEnvelope,
  formatCustomThemeOwner,
  listCustomThemes,
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

  const listed = await listCustomThemes(
    db,
    {
      authorId: user.id,
      status: statusFilter,
      themeType: query.type,
      sort: 'newest',
      page,
      limit
    },
    formatCustomThemeOwner
  );

  return createApiEnvelope(listed);
});
