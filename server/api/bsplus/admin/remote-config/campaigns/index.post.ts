import { requireAdmin } from '../../../../../utils/auth';
import { getDB } from '../../../../../utils/db';
import { createApiEnvelope, createCampaign } from '../../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody<Record<string, unknown>>(event);
  const db = getDB(event);
  const campaign = await createCampaign(db, body || {});
  return createApiEnvelope({ campaign, published: false });
});
