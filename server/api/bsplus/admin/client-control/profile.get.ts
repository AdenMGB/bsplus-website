import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { buildClientControlProfile } from '../../../../utils/bsplusClientControlProfile';
import { createApiEnvelope } from '../../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const query = getQuery(event);
  const userId =
    typeof query.userId === 'string'
      ? query.userId
      : typeof query.user_id === 'string'
        ? query.user_id
        : undefined;
  const installId =
    typeof query.installId === 'string'
      ? query.installId
      : typeof query.install_id === 'string'
        ? query.install_id
        : undefined;

  const db = getDB(event);
  const profile = await buildClientControlProfile(event, db, { userId, installId });
  return createApiEnvelope(profile);
});
