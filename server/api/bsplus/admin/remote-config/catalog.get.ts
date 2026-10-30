import { requireAdmin } from '../../../../utils/auth';
import { createApiEnvelope } from '../../../../utils/customThemes';
import { getBsplusRemoteConfigCatalog } from '../../../../utils/bsplusRemoteConfigCatalog';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  return createApiEnvelope(getBsplusRemoteConfigCatalog());
});
