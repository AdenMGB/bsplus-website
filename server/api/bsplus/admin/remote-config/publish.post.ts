import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { createApiEnvelope, publishRemoteConfig } from '../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const snapshot = await publishRemoteConfig(db);
  return createApiEnvelope({
    published: true,
    configVersion: snapshot.configVersion,
    etag: snapshot.etag,
  });
});
