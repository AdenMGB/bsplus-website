import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { getBucket } from '../../../../utils/r2';
import { createApiEnvelope, upsertRemoteThemePackage } from '../../../../utils/bsplusRemoteThemePackages';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody<Record<string, unknown>>(event);
  const packageId =
    typeof body.packageId === 'string'
      ? body.packageId.trim()
      : typeof body.package_id === 'string'
        ? body.package_id.trim()
        : '';
  if (!packageId) {
    throw createError({ statusCode: 400, statusMessage: 'packageId is required' });
  }

  const db = getDB(event);
  const bucket = getBucket(event);
  const pkg = await upsertRemoteThemePackage(db, bucket, packageId, body || {});
  setResponseStatus(event, 201);
  return createApiEnvelope({ package: pkg });
});
