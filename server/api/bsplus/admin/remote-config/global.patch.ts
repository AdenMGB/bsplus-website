import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { createApiEnvelope, patchGlobalSettings } from '../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody<Record<string, unknown>>(event);
  const db = getDB(event);
  const global = await patchGlobalSettings(db, body || {});
  return createApiEnvelope({ global, published: false });
});
