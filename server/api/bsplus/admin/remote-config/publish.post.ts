import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { createApiEnvelope, publishRemoteConfig } from '../../../../utils/bsplusRemoteConfig';
import { syncRemoteConfigToGithub } from '../../../../utils/bsplusRemoteConfigGithub';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);

  // 1) Authoritative: write published snapshot to D1 (GET /api/bsplus/remote-config)
  const snapshot = await publishRemoteConfig(db);

  // 2) Fallback mirror only — same global/features/campaigns as the snapshot above
  const github = await syncRemoteConfigToGithub(event, db, snapshot, 'publish');

  return createApiEnvelope({
    published: true,
    database: {
      updated: true,
      configVersion: snapshot.configVersion,
      etag: snapshot.etag,
    },
    configVersion: snapshot.configVersion,
    etag: snapshot.etag,
    github,
  });
});
