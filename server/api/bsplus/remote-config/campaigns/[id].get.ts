import { getDB } from '../../../../utils/db';
import {
  createApiEnvelope,
  getCampaignById,
  isValidCampaignId,
  normalizeCampaignId,
  sendRemoteConfigError,
} from '../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, 'id');
  const id = idParam ? normalizeCampaignId(idParam) : '';
  if (!id || !isValidCampaignId(id)) {
    return sendRemoteConfigError(event, 422, 'Invalid campaign id', 'VALIDATION_ERROR');
  }

  const db = getDB(event);

  try {
    const campaign = await getCampaignById(db, id);
    if (!campaign) {
      return sendRemoteConfigError(event, 404, 'Campaign not found', 'NOT_FOUND');
    }
    return createApiEnvelope(campaign);
  } catch (e: unknown) {
    console.error('[bsplus/remote-config/campaigns]', e);
    return sendRemoteConfigError(event, 500, 'Failed to load campaign', 'INTERNAL_ERROR');
  }
});
