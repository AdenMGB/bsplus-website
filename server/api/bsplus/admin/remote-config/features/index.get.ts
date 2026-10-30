import { requireAdmin } from '../../../../../utils/auth';
import { getDB } from '../../../../../utils/db';
import { createApiEnvelope, loadDraftFeatures } from '../../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const features = await loadDraftFeatures(db);
  return createApiEnvelope({ features });
});
