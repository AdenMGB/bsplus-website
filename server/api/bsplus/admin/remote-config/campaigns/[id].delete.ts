import { requireAdmin } from '../../../../../utils/auth';
import { getDB } from '../../../../../utils/db';
import {
  createApiEnvelope,
  deleteCampaign,
  isValidCampaignId,
  normalizeCampaignId,
} from '../../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const idParam = getRouterParam(event, 'id');
  const id = idParam ? normalizeCampaignId(idParam) : '';
  if (!id || !isValidCampaignId(id)) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid campaign id' });
  }

  const db = getDB(event);
  const deleted = await deleteCampaign(db, id);
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Campaign not found' });
  }

  return createApiEnvelope({ id, deleted: true, published: false });
});
