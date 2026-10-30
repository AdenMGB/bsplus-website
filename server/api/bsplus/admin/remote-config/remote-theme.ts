import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import {
  createApiEnvelope,
  loadDraftRemoteThemeDirective,
  patchRemoteThemeDirective,
} from '../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDB(event);

  if (getMethod(event) === 'GET') {
    const remoteTheme = await loadDraftRemoteThemeDirective(db);
    return createApiEnvelope({ remoteTheme });
  }

  const body = await readBody<Record<string, unknown>>(event);
  const remoteTheme = await patchRemoteThemeDirective(db, body || {});
  return createApiEnvelope({ remoteTheme, published: false });
});
