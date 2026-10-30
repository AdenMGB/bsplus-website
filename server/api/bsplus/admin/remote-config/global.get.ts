import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import {
  createApiEnvelope,
  getPublishedMeta,
  loadDraftFeatures,
  loadDraftGlobal,
} from '../../../../utils/bsplusRemoteConfig';
import { getBsplusRemoteConfigCatalog } from '../../../../utils/bsplusRemoteConfigCatalog';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const global = await loadDraftGlobal(db);
  const features = await loadDraftFeatures(db);
  const published = await getPublishedMeta(db);

  return createApiEnvelope({
    global,
    features,
    feature_count: Object.keys(features).length,
    catalog: getBsplusRemoteConfigCatalog(),
    published: published
      ? {
          configVersion: published.config_version,
          etag: published.etag,
          published_at: published.published_at,
        }
      : null,
  });
});
