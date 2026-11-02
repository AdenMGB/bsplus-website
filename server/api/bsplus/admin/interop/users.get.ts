import { requireAdmin } from '../../../../utils/auth';
import { searchAccountsUsersInterop } from '../../../../utils/accountsInterop';
import { createApiEnvelope } from '../../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const query = getQuery(event);
  const q = typeof query.q === 'string' ? query.q : '';
  const page = typeof query.page === 'string' ? parseInt(query.page, 10) : 1;
  const pageSize = typeof query.pageSize === 'string' ? parseInt(query.pageSize, 10) : 20;

  try {
    const data = await searchAccountsUsersInterop(event, { q, page, pageSize });
    return createApiEnvelope(data);
  } catch (e: unknown) {
    const err = e as { statusCode?: number; statusMessage?: string; message?: string };
    throw createError({
      statusCode: err.statusCode ?? 502,
      statusMessage: err.statusMessage || err.message || 'Accounts user search failed',
    });
  }
});
