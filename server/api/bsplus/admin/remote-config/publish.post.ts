import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { createApiEnvelope, publishRemoteConfig } from '../../../../utils/bsplusRemoteConfig';
import { syncRemoteConfigToGithub } from '../../../../utils/bsplusRemoteConfigGithub';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const snapshot = await publishRemoteConfig(db);
  const github = await syncRemoteConfigToGithub(event, db, snapshot, 'publish');

  return createApiEnvelope({
    published: true,
    configVersion: snapshot.configVersion,
    etag: snapshot.etag,
    github,
  });
});
