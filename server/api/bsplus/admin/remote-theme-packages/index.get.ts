import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { createApiEnvelope, listAdminRemoteThemePackages } from '../../../../utils/bsplusRemoteThemePackages';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const packages = await listAdminRemoteThemePackages(db);
  return createApiEnvelope({ packages });
});
