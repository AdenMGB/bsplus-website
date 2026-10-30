import { requireAdmin } from '../../../../../utils/auth';
import { getDB } from '../../../../../utils/db';
import {
  createApiEnvelope,
  listAdminCampaignRows,
  mapAdminCampaignRow,
} from '../../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const rows = await listAdminCampaignRows(db);
  return createApiEnvelope({
    campaigns: rows.map(mapAdminCampaignRow),
  });
});
