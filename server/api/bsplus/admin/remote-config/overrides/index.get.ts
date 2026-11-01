import { requireAdmin } from '../../../../../utils/auth';
import { getDB } from '../../../../../utils/db';
import { listOverrides } from '../../../../../utils/bsplusRemoteConfigOverrides';
import { createApiEnvelope } from '../../../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const query = getQuery(event);
  const db = getDB(event);
  const overrides = await listOverrides(db, {
    scope: typeof query.scope === 'string' ? query.scope : undefined,
    scopeId: typeof query.scopeId === 'string' ? query.scopeId : typeof query.scope_id === 'string' ? query.scope_id : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
  });
  return createApiEnvelope({ overrides });
});
