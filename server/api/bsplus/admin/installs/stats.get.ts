import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { createApiEnvelope, getInstallStats } from '../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const stats = await getInstallStats(db);
  return createApiEnvelope(stats);
});
