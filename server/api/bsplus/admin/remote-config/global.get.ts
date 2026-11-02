import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import {
  createApiEnvelope,
  getPublishedMeta,
  loadDraftFeatures,
  loadDraftGlobal,
} from '../../../../utils/bsplusRemoteConfig';
import { parseAudienceRule } from '../../../../utils/bsplusRemoteConfigTargeting';
import { getBsplusRemoteConfigCatalog } from '../../../../utils/bsplusRemoteConfigCatalog';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const global = await loadDraftGlobal(db);
  const features = await loadDraftFeatures(db);
  const published = await getPublishedMeta(db);
  const remoteTheme = await loadDraftRemoteThemeDirective(db);
  const targetingRow = await db
    .prepare('SELECT remote_theme_targeting_json FROM bsplus_remote_config_global WHERE id = 1')
    .first<{ remote_theme_targeting_json?: string | null }>();
  const remoteThemeTargeting =
    typeof targetingRow?.remote_theme_targeting_json === 'string' &&
    targetingRow.remote_theme_targeting_json.trim()
      ? parseAudienceRule(targetingRow.remote_theme_targeting_json)
      : null;

  return createApiEnvelope({
    global,
    features,
    remoteTheme,
    remoteThemeTargeting,
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
