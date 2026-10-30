import { requireAdmin } from '../../../../../utils/auth';
import { getDB } from '../../../../../utils/db';
import {
  createApiEnvelope,
  isValidCampaignId,
  normalizeCampaignId,
  updateCampaign,
} from '../../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const idParam = getRouterParam(event, 'id');
  const id = idParam ? normalizeCampaignId(idParam) : '';
  if (!id || !isValidCampaignId(id)) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid campaign id' });
  }

  const body = await readBody<Record<string, unknown>>(event);
  const db = getDB(event);
  const campaign = await updateCampaign(db, id, body || {});
  return createApiEnvelope({ campaign, published: false });
});
