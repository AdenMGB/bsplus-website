import { getDB } from '../../../utils/db';
import {
  checkInstallRegisterRateLimit,
  createApiEnvelope,
  registerBsplusInstall,
  resolveRegisterUserId,
  sendRemoteConfigError,
  validateRegisterPayload,
} from '../../../utils/bsplusRemoteConfig';

export default defineEventHandler(async (event) => {
  let body: unknown;
  try {
    body = await readBody(event);
  } catch {
    return sendRemoteConfigError(event, 400, 'Malformed request body', 'VALIDATION_ERROR');
  }

  const validated = validateRegisterPayload(body);
  if (!validated.ok) {
    return sendRemoteConfigError(event, 422, validated.error, 'VALIDATION_ERROR');
  }

  const db = getDB(event);

  try {
    const rate = await checkInstallRegisterRateLimit(db, event, validated.data.installId);
    if (rate.limited) {
      return sendRemoteConfigError(
        event,
        429,
        'Too many install registration requests',
        'RATE_LIMITED',
        rate.retryAfterSeconds
      );
    }

    const userId = await resolveRegisterUserId(event, validated.data.userId);
    await registerBsplusInstall(db, validated.data, userId);

    setResponseStatus(event, 201);
    return createApiEnvelope({ registered: true });
  } catch (e: unknown) {
    console.error('[bsplus/installs/register]', e);
    return sendRemoteConfigError(event, 500, 'Failed to register install', 'INTERNAL_ERROR');
  }
});
