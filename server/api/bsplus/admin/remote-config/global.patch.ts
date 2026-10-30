import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { createApiEnvelope, patchGlobalSettings, patchRemoteThemeDirective } from '../../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody<Record<string, unknown>>(event);
  const db = getDB(event);
  const global = await patchGlobalSettings(db, body || {});
  const remoteTheme =
    body && 'remoteTheme' in body
      ? await patchRemoteThemeDirective(db, body)
      : undefined;
  return createApiEnvelope({
    global,
    ...(remoteTheme !== undefined ? { remoteTheme } : {}),
    published: false,
  });
});
