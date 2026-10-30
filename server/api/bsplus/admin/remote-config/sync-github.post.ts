import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { createApiEnvelope } from '../../../../utils/bsplusRemoteConfig';
import { forceSyncRemoteConfigToGithub } from '../../../../utils/bsplusRemoteConfigGithub';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);
  const github = await forceSyncRemoteConfigToGithub(event, db);

  if (!github.synced && github.skipped_reason === 'missing_token') {
    throw createError({
      statusCode: 503,
      statusMessage: 'GITHUB_BS_STATUS_TOKEN is not configured on the worker',
    });
  }

  return createApiEnvelope({
    github,
    message: github.synced
      ? 'GitHub mirror updated from current draft config'
      : github.error ?? 'GitHub sync did not complete',
  });
});
