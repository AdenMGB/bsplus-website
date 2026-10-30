import { requireAdmin } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { getBucket } from '../../../../utils/r2';
import {
  createApiEnvelope,
  deleteRemoteThemePackage,
  getAdminRemoteThemePackage,
  isValidRemoteThemePackageId,
  upsertRemoteThemePackage,
} from '../../../../utils/bsplusRemoteThemePackages';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const packageId = getRouterParam(event, 'packageId')?.trim() ?? '';
  if (!isValidRemoteThemePackageId(packageId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid packageId' });
  }

  const db = getDB(event);
  const bucket = getBucket(event);
  const method = getMethod(event);

  if (method === 'GET') {
    const pkg = await getAdminRemoteThemePackage(db, packageId);
    if (!pkg) {
      throw createError({ statusCode: 404, statusMessage: 'Package not found' });
    }
    return createApiEnvelope({ package: pkg });
  }

  if (method === 'PATCH') {
    const body = await readBody<Record<string, unknown>>(event);
    const pkg = await upsertRemoteThemePackage(db, bucket, packageId, body || {});
    return createApiEnvelope({ package: pkg });
  }

  if (method === 'DELETE') {
    const removed = await deleteRemoteThemePackage(db, bucket, packageId);
    if (!removed) {
      throw createError({ statusCode: 404, statusMessage: 'Package not found' });
    }
    return createApiEnvelope({ deleted: true });
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
});
