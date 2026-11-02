import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import {
  searchAccountsInstallLinksInterop,
  searchLocalBsplusInstalls,
} from '../../../../utils/accountsInterop';
import { createApiEnvelope } from '../../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const query = getQuery(event);
  const q = typeof query.q === 'string' ? query.q : '';
  const page = typeof query.page === 'string' ? parseInt(query.page, 10) : 1;
  const pageSize = typeof query.pageSize === 'string' ? parseInt(query.pageSize, 10) : 20;
  const userId =
    typeof query.userId === 'string'
      ? query.userId
      : typeof query.cloudUserId === 'string'
        ? query.cloudUserId
        : null;

  const db = getDB(event);

  const [cloud, local] = await Promise.all([
    searchAccountsInstallLinksInterop(event, { q, page, pageSize, cloudUserId: userId }).catch(() => ({
      installs: [],
      total: 0,
      page,
      pageSize,
      totalPages: 1,
    })),
    searchLocalBsplusInstalls(db, { q, page, pageSize, userId }),
  ]);

  const cloudInstalls = (cloud.installs ?? []).map((row) => ({
    ...row,
    source: 'accounts_link' as const,
  }));

  return createApiEnvelope({
    cloud: {
      installs: cloudInstalls,
      total: cloud.total,
      page: cloud.page,
      pageSize: cloud.pageSize,
      totalPages: cloud.totalPages,
    },
    website: local,
  });
});
