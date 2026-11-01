import { getDB } from '../../utils/db';
import {
  checkRemoteConfigGetRateLimit,
  createApiEnvelope,
  ensurePublishedSnapshot,
  sendRemoteConfigError,
  validateRemoteConfigQuery,
} from '../../utils/bsplusRemoteConfig';
import { resolveBsplusClientUserId } from '../../utils/bsplusExtensionClientContext';
import {
  computePersonalizedEtag,
  getPersonalizationRevision,
  personalizeRemoteConfigForClient,
} from '../../utils/bsplusRemoteConfigTargeting';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const validated = validateRemoteConfigQuery(query as Record<string, unknown>);
  if (!validated.ok) {
    return sendRemoteConfigError(event, 422, validated.error, 'VALIDATION_ERROR');
  }

  const db = getDB(event);

  try {
    const rate = await checkRemoteConfigGetRateLimit(db, event);
    if (rate.limited) {
      return sendRemoteConfigError(
        event,
        429,
        'Too many remote-config requests',
        'RATE_LIMITED',
        rate.retryAfterSeconds
      );
    }

    const resolvedUserId = await resolveBsplusClientUserId(event, validated.userId);
    const clientContext = {
      installId: validated.installId,
      extensionVersion: validated.extensionVersion,
      channel: validated.channel,
      hostname: validated.hostname,
      userId: resolvedUserId,
    };

    const baseSnapshot = await ensurePublishedSnapshot(db);
    const snapshot = await personalizeRemoteConfigForClient(db, baseSnapshot, clientContext);
    const revision = await getPersonalizationRevision(
      db,
      clientContext.installId,
      clientContext.userId
    );
    const etag = await computePersonalizedEtag(baseSnapshot.etag, clientContext, revision);

    const ifNoneMatch = getHeader(event, 'if-none-match')?.trim();
    if (ifNoneMatch && ifNoneMatch === etag) {
      setResponseStatus(event, 304);
      setHeader(event, 'ETag', etag);
      setHeader(event, 'Cache-Control', 'private, max-age=60, stale-while-revalidate=300');
      setHeader(event, 'Vary', 'Authorization');
      return null;
    }

    setHeader(event, 'ETag', etag);
    setHeader(event, 'Cache-Control', 'private, max-age=60, stale-while-revalidate=300');
    setHeader(event, 'Vary', 'Authorization');

    return createApiEnvelope(snapshot);
  } catch (e: unknown) {
    console.error('[bsplus/remote-config]', e);
    return sendRemoteConfigError(event, 500, 'Failed to load remote config', 'INTERNAL_ERROR');
  }
});
