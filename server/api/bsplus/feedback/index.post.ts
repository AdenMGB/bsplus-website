/**
 * POST /api/bsplus/feedback
 * Public BetterSEQTA+ extension feedback submission (anonymous by default).
 */
import { getDB } from '../../../utils/db';
import {
  FEEDBACK_MAX_BODY_BYTES,
  checkFeedbackRateLimits,
  generateFeedbackId,
  getClientIp,
  getTruncatedUserAgent,
  hashIp,
  sendFeedbackError,
  toIsoTimestamp,
  validateFeedbackPayload,
} from '../../../utils/feedback';

export default defineEventHandler(async (event) => {
  const contentLengthHeader = getHeader(event, 'content-length');
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > FEEDBACK_MAX_BODY_BYTES) {
      return sendFeedbackError(
        event,
        413,
        'Request body exceeds 32 KB limit',
        'PAYLOAD_TOO_LARGE'
      );
    }
  }

  let rawBody: string | Buffer | null = null;
  try {
    rawBody = await readRawBody(event, false);
  } catch {
    return sendFeedbackError(event, 400, 'Malformed request body', 'VALIDATION_ERROR');
  }

  if (rawBody == null) {
    return sendFeedbackError(event, 400, 'Request body is required', 'VALIDATION_ERROR');
  }

  const bodyBytes =
    typeof rawBody === 'string' ? new TextEncoder().encode(rawBody).byteLength : rawBody.byteLength;
  if (bodyBytes > FEEDBACK_MAX_BODY_BYTES) {
    return sendFeedbackError(
      event,
      413,
      'Request body exceeds 32 KB limit',
      'PAYLOAD_TOO_LARGE'
    );
  }

  const bodyText = typeof rawBody === 'string' ? rawBody : new TextDecoder().decode(rawBody);

  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return sendFeedbackError(event, 400, 'Malformed JSON', 'VALIDATION_ERROR');
  }

  const validated = validateFeedbackPayload(parsed);
  if (!validated.ok) {
    return sendFeedbackError(event, 422, validated.error, validated.code);
  }

  const data = validated.data;
  const config = useRuntimeConfig(event);
  const ipSalt =
    (config.feedbackIpSalt as string | undefined) || 'bsplus-feedback-ip-salt-v1';
  const ip = getClientIp(event);
  const ipHash = await hashIp(ip, ipSalt);
  const userAgent = getTruncatedUserAgent(event);
  const db = getDB(event);

  try {
    const rateLimit = await checkFeedbackRateLimits(db, data.installId, ipHash);
    if (rateLimit.limited) {
      return sendFeedbackError(
        event,
        429,
        'Too many feedback submissions. Please try again later.',
        'RATE_LIMITED',
        rateLimit.retryAfterSeconds
      );
    }

    const id = generateFeedbackId();
    const createdAt = Math.floor(Date.now() / 1000);

    await db
      .prepare(
        `INSERT INTO feedback_submissions (
          id, schema_version, install_id, category, subject, message,
          extension_version, browser, browser_version, os, channel,
          contact_included, contact_name, contact_email,
          instance_included, instance_hostname, instance_product,
          context_page, context_locale, context_dark_mode,
          client_submitted_at, status, ip_hash, user_agent, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, 'received', ?, ?, ?, ?
        )`
      )
      .bind(
        id,
        data.schemaVersion,
        data.installId,
        data.category,
        data.subject,
        data.message,
        data.extension.version,
        data.extension.browser,
        data.extension.browserVersion,
        data.extension.os,
        data.extension.channel,
        data.contactIncluded ? 1 : 0,
        data.contactName,
        data.contactEmail,
        data.instanceIncluded ? 1 : 0,
        data.instanceHostname,
        data.instanceProduct,
        data.contextPage,
        data.contextLocale,
        data.contextDarkMode === null ? null : data.contextDarkMode ? 1 : 0,
        data.clientSubmittedAt,
        ipHash,
        userAgent,
        createdAt,
        createdAt
      )
      .run();

    await db
      .prepare(
        `INSERT INTO feedback_installs (install_id, first_seen_at, last_seen_at, submission_count)
         VALUES (?, ?, ?, 1)
         ON CONFLICT(install_id) DO UPDATE SET
           last_seen_at = excluded.last_seen_at,
           submission_count = feedback_installs.submission_count + 1`
      )
      .bind(data.installId, createdAt, createdAt)
      .run();

    setResponseStatus(event, 201);
    return {
      id,
      created_at: toIsoTimestamp(createdAt),
      status: 'received',
    };
  } catch (e) {
    console.error('[Feedback] Failed to store submission');
    throw createError({
      statusCode: 500,
      message: 'Failed to store feedback',
      data: { error: 'Failed to store feedback', code: 'INTERNAL_ERROR' },
      cause: e,
    });
  }
});
