import type { H3Event } from 'h3';
import { getHeader, getRequestIP, setResponseHeader, setResponseStatus } from 'h3';

export const FEEDBACK_MAX_BODY_BYTES = 32 * 1024;
export const FEEDBACK_SCHEMA_VERSION = 1;

export const FEEDBACK_CATEGORIES = ['bug', 'feature', 'question', 'other'] as const;
export const FEEDBACK_BROWSERS = ['chrome', 'firefox', 'safari', 'edge', 'other'] as const;
export const FEEDBACK_CHANNELS = ['stable', 'dev', 'nightly', 'unknown'] as const;
export const FEEDBACK_PRODUCTS = ['learn', 'engage', 'unknown'] as const;
export const FEEDBACK_STATUSES = [
  'received',
  'triaged',
  'in_progress',
  'resolved',
  'wontfix',
  'spam',
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
export type FeedbackBrowser = (typeof FEEDBACK_BROWSERS)[number];
export type FeedbackChannel = (typeof FEEDBACK_CHANNELS)[number];
export type FeedbackProduct = (typeof FEEDBACK_PRODUCTS)[number];
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export type FeedbackErrorCode =
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'UNSUPPORTED_SCHEMA'
  | 'PAYLOAD_TOO_LARGE';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOSTNAME_RE =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$|^localhost$/i;
const ULID_ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'cookies',
  'bsplus_token',
  'token',
  'access_token',
  'refresh_token',
  'session',
  'password',
  'secret',
]);

const RATE_LIMITS = {
  installHourly: { max: 5, windowSeconds: 60 * 60 },
  ipHourly: { max: 20, windowSeconds: 60 * 60 },
  installDaily: { max: 50, windowSeconds: 60 * 60 * 24 },
} as const;

export interface ValidatedFeedback {
  schemaVersion: number;
  installId: string;
  category: FeedbackCategory;
  subject: string | null;
  message: string;
  extension: {
    version: string;
    browser: FeedbackBrowser;
    browserVersion: string | null;
    os: string;
    channel: FeedbackChannel | null;
  };
  contactIncluded: boolean;
  contactName: string | null;
  contactEmail: string | null;
  instanceIncluded: boolean;
  instanceHostname: string | null;
  instanceProduct: FeedbackProduct | null;
  contextPage: string | null;
  contextLocale: string | null;
  contextDarkMode: boolean | null;
  clientSubmittedAt: number | null;
}

export type FeedbackValidationResult =
  | { ok: true; data: ValidatedFeedback }
  | { ok: false; error: string; code: FeedbackErrorCode };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value.trim();
}

function hasSensitiveKeys(value: unknown, depth = 0): boolean {
  if (!isRecord(value) || depth > 4) return false;
  for (const key of Object.keys(value)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) return true;
    if (hasSensitiveKeys(value[key], depth + 1)) return true;
  }
  return false;
}

export function generateFeedbackId(): string {
  const now = Date.now();
  let time = now;
  let id = '';

  for (let i = 9; i >= 0; i -= 1) {
    id = ULID_ENCODING[time % 32] + id;
    time = Math.floor(time / 32);
  }

  const random = new Uint8Array(16);
  crypto.getRandomValues(random);
  for (let i = 0; i < 16; i += 1) {
    id += ULID_ENCODING[random[i]! % 32];
  }

  return `fb_${id}`;
}

export function toIsoTimestamp(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString();
}

export async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getClientIp(event: H3Event): string {
  return (
    getHeader(event, 'cf-connecting-ip') ||
    getRequestIP(event, { xForwardedFor: true }) ||
    'unknown'
  );
}

export function getTruncatedUserAgent(event: H3Event, max = 512): string | null {
  const ua = getHeader(event, 'user-agent');
  if (!ua) return null;
  return ua.length > max ? ua.slice(0, max) : ua;
}

export function sendFeedbackError(
  event: H3Event,
  statusCode: number,
  error: string,
  code: FeedbackErrorCode,
  retryAfterSeconds?: number
): { error: string; code: FeedbackErrorCode } {
  setResponseStatus(event, statusCode);
  if (retryAfterSeconds !== undefined) {
    setResponseHeader(event, 'Retry-After', String(retryAfterSeconds));
  }
  return { error, code };
}

export function isValidInstallId(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value.trim());
}

/** Public client-safe projection (no contact/instance/notes/IP). */
export function mapPublicFeedbackStatus(row: Record<string, any>) {
  const hasResponse = !!(row.admin_response && String(row.admin_response).trim());
  return {
    id: row.id as string,
    status: row.status as string,
    category: row.category as string,
    subject: (row.subject as string | null) ?? null,
    created_at: toIsoTimestamp(row.created_at),
    updated_at: toIsoTimestamp(row.updated_at),
    has_response: hasResponse,
    response: hasResponse ? (row.admin_response as string) : null,
    responded_at: row.responded_at ? toIsoTimestamp(row.responded_at) : null,
  };
}

function deriveSubject(message: string): string {
  const firstLine = message.split(/\r?\n/, 1)[0] || message;
  return firstLine.length > 120 ? `${firstLine.slice(0, 117)}...` : firstLine;
}

function parseClientSubmittedAt(value: unknown): number | null | 'invalid' {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || !value.trim()) return 'invalid';
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return 'invalid';
  return Math.floor(ms / 1000);
}

export function validateFeedbackPayload(body: unknown): FeedbackValidationResult {
  if (!isRecord(body)) {
    return { ok: false, error: 'Request body must be a JSON object', code: 'VALIDATION_ERROR' };
  }

  if (hasSensitiveKeys(body)) {
    return {
      ok: false,
      error: 'Request contains disallowed sensitive fields',
      code: 'VALIDATION_ERROR',
    };
  }

  if (body.schemaVersion !== FEEDBACK_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Unsupported schemaVersion. Expected ${FEEDBACK_SCHEMA_VERSION}`,
      code: 'UNSUPPORTED_SCHEMA',
    };
  }

  const installId = asTrimmedString(body.installId);
  if (!installId || !UUID_RE.test(installId)) {
    return {
      ok: false,
      error: 'installId must be a valid RFC 4122 UUID',
      code: 'VALIDATION_ERROR',
    };
  }

  const category = asTrimmedString(body.category);
  if (!category || !FEEDBACK_CATEGORIES.includes(category as FeedbackCategory)) {
    return {
      ok: false,
      error: `category must be one of: ${FEEDBACK_CATEGORIES.join(', ')}`,
      code: 'VALIDATION_ERROR',
    };
  }

  const message = asTrimmedString(body.message);
  if (!message || message.length < 10 || message.length > 4000) {
    return {
      ok: false,
      error: 'message must be 10–4000 characters after trimming',
      code: 'VALIDATION_ERROR',
    };
  }

  if (!isRecord(body.extension)) {
    return {
      ok: false,
      error: 'extension object is required',
      code: 'VALIDATION_ERROR',
    };
  }

  const extensionVersion = asTrimmedString(body.extension.version);
  if (!extensionVersion || extensionVersion.length > 32) {
    return {
      ok: false,
      error: 'extension.version is required (max 32 characters)',
      code: 'VALIDATION_ERROR',
    };
  }

  const browser = asTrimmedString(body.extension.browser);
  if (!browser || !FEEDBACK_BROWSERS.includes(browser as FeedbackBrowser)) {
    return {
      ok: false,
      error: `extension.browser must be one of: ${FEEDBACK_BROWSERS.join(', ')}`,
      code: 'VALIDATION_ERROR',
    };
  }

  const os = asTrimmedString(body.extension.os);
  if (!os || os.length > 64) {
    return {
      ok: false,
      error: 'extension.os is required (max 64 characters)',
      code: 'VALIDATION_ERROR',
    };
  }

  let browserVersion: string | null = null;
  if (body.extension.browserVersion !== undefined && body.extension.browserVersion !== null) {
    const value = asTrimmedString(body.extension.browserVersion);
    if (!value || value.length > 64) {
      return {
        ok: false,
        error: 'extension.browserVersion must be at most 64 characters',
        code: 'VALIDATION_ERROR',
      };
    }
    browserVersion = value;
  }

  let channel: FeedbackChannel | null = null;
  if (body.extension.channel !== undefined && body.extension.channel !== null) {
    const value = asTrimmedString(body.extension.channel);
    if (!value || !FEEDBACK_CHANNELS.includes(value as FeedbackChannel)) {
      return {
        ok: false,
        error: `extension.channel must be one of: ${FEEDBACK_CHANNELS.join(', ')}`,
        code: 'VALIDATION_ERROR',
      };
    }
    channel = value as FeedbackChannel;
  }

  let subject: string | null = null;
  if (body.subject !== undefined && body.subject !== null) {
    const value = asTrimmedString(body.subject);
    if (!value || value.length > 120) {
      return {
        ok: false,
        error: 'subject must be 1–120 characters when provided',
        code: 'VALIDATION_ERROR',
      };
    }
    subject = value;
  } else {
    subject = deriveSubject(message);
  }

  let contactIncluded = false;
  let contactName: string | null = null;
  let contactEmail: string | null = null;
  if (isRecord(body.contact) && body.contact.include === true) {
    contactIncluded = true;
    contactName = asTrimmedString(body.contact.name);
    contactEmail = asTrimmedString(body.contact.email);

    if (!contactName || contactName.length > 80) {
      return {
        ok: false,
        error: 'contact.name is required (max 80 characters) when contact.include is true',
        code: 'VALIDATION_ERROR',
      };
    }
    if (!contactEmail || contactEmail.length > 254 || !EMAIL_RE.test(contactEmail)) {
      return {
        ok: false,
        error: 'contact.email must be a valid email when contact.include is true',
        code: 'VALIDATION_ERROR',
      };
    }
  }

  let instanceIncluded = false;
  let instanceHostname: string | null = null;
  let instanceProduct: FeedbackProduct | null = null;
  if (isRecord(body.instance) && body.instance.include === true) {
    instanceIncluded = true;
    const hostname = asTrimmedString(body.instance.hostname)?.toLowerCase() ?? null;

    if (
      !hostname ||
      hostname.length > 253 ||
      hostname.includes('/') ||
      hostname.includes('?') ||
      hostname.includes('@') ||
      hostname.includes(':') ||
      !HOSTNAME_RE.test(hostname)
    ) {
      return {
        ok: false,
        error:
          'instance.hostname must be a valid hostname (no path, query, port, or credentials) when instance.include is true',
        code: 'VALIDATION_ERROR',
      };
    }
    instanceHostname = hostname;

    if (body.instance.product !== undefined && body.instance.product !== null) {
      const product = asTrimmedString(body.instance.product);
      if (!product || !FEEDBACK_PRODUCTS.includes(product as FeedbackProduct)) {
        return {
          ok: false,
          error: `instance.product must be one of: ${FEEDBACK_PRODUCTS.join(', ')}`,
          code: 'VALIDATION_ERROR',
        };
      }
      instanceProduct = product as FeedbackProduct;
    } else {
      instanceProduct = 'unknown';
    }
  }

  let contextPage: string | null = null;
  let contextLocale: string | null = null;
  let contextDarkMode: boolean | null = null;
  if (isRecord(body.context)) {
    if (body.context.page !== undefined && body.context.page !== null) {
      const page = asTrimmedString(body.context.page);
      if (!page || page.length > 64) {
        return {
          ok: false,
          error: 'context.page must be at most 64 characters',
          code: 'VALIDATION_ERROR',
        };
      }
      contextPage = page;
    }
    if (body.context.locale !== undefined && body.context.locale !== null) {
      const locale = asTrimmedString(body.context.locale);
      if (!locale || locale.length > 32) {
        return {
          ok: false,
          error: 'context.locale must be at most 32 characters',
          code: 'VALIDATION_ERROR',
        };
      }
      contextLocale = locale;
    }
    if (body.context.darkMode !== undefined && body.context.darkMode !== null) {
      if (typeof body.context.darkMode !== 'boolean') {
        return {
          ok: false,
          error: 'context.darkMode must be a boolean',
          code: 'VALIDATION_ERROR',
        };
      }
      contextDarkMode = body.context.darkMode;
    }
  }

  const clientSubmittedAt = parseClientSubmittedAt(body.clientSubmittedAt);
  if (clientSubmittedAt === 'invalid') {
    return {
      ok: false,
      error: 'clientSubmittedAt must be a valid ISO 8601 timestamp',
      code: 'VALIDATION_ERROR',
    };
  }

  return {
    ok: true,
    data: {
      schemaVersion: FEEDBACK_SCHEMA_VERSION,
      installId: installId.toLowerCase(),
      category: category as FeedbackCategory,
      subject,
      message,
      extension: {
        version: extensionVersion,
        browser: browser as FeedbackBrowser,
        browserVersion,
        os,
        channel,
      },
      contactIncluded,
      contactName,
      contactEmail,
      instanceIncluded,
      instanceHostname,
      instanceProduct,
      contextPage,
      contextLocale,
      contextDarkMode,
      clientSubmittedAt,
    },
  };
}

export function mapFeedbackRow(row: Record<string, any>, options: { includeUserAgent?: boolean } = {}) {
  const mapped: Record<string, unknown> = {
    id: row.id,
    schema_version: row.schema_version,
    install_id: row.install_id,
    category: row.category,
    subject: row.subject,
    message: row.message,
    extension: {
      version: row.extension_version,
      browser: row.browser,
      browser_version: row.browser_version,
      os: row.os,
      channel: row.channel,
    },
    contact: {
      include: !!row.contact_included,
      name: row.contact_name,
      email: row.contact_email,
    },
    instance: {
      include: !!row.instance_included,
      hostname: row.instance_hostname,
      product: row.instance_product,
    },
    context: {
      page: row.context_page,
      locale: row.context_locale,
      dark_mode:
        row.context_dark_mode === null || row.context_dark_mode === undefined
          ? null
          : !!row.context_dark_mode,
    },
    client_submitted_at: row.client_submitted_at
      ? toIsoTimestamp(row.client_submitted_at)
      : null,
    status: row.status,
    internal_notes: row.internal_notes,
    admin_response: row.admin_response ?? null,
    responded_at: row.responded_at ? toIsoTimestamp(row.responded_at) : null,
    responded_by: row.responded_by ?? null,
    response_emailed_at: row.response_emailed_at
      ? toIsoTimestamp(row.response_emailed_at)
      : null,
    admin_notified_at: row.admin_notified_at
      ? toIsoTimestamp(row.admin_notified_at)
      : null,
    created_at: toIsoTimestamp(row.created_at),
    updated_at: toIsoTimestamp(row.updated_at),
  };

  if (options.includeUserAgent) {
    mapped.user_agent = row.user_agent;
  }

  return mapped;
}

export async function checkFeedbackRateLimits(
  db: any,
  installId: string,
  ipHash: string
): Promise<{ limited: false } | { limited: true; retryAfterSeconds: number }> {
  const now = Math.floor(Date.now() / 1000);

  const installHourlySince = now - RATE_LIMITS.installHourly.windowSeconds;
  const installHourly = await db
    .prepare(
      `SELECT COUNT(*) AS count FROM feedback_submissions
       WHERE install_id = ? AND created_at >= ?`
    )
    .bind(installId, installHourlySince)
    .first<{ count: number }>();

  if ((installHourly?.count ?? 0) >= RATE_LIMITS.installHourly.max) {
    return { limited: true, retryAfterSeconds: RATE_LIMITS.installHourly.windowSeconds };
  }

  const ipHourlySince = now - RATE_LIMITS.ipHourly.windowSeconds;
  const ipHourly = await db
    .prepare(
      `SELECT COUNT(*) AS count FROM feedback_submissions
       WHERE ip_hash = ? AND created_at >= ?`
    )
    .bind(ipHash, ipHourlySince)
    .first<{ count: number }>();

  if ((ipHourly?.count ?? 0) >= RATE_LIMITS.ipHourly.max) {
    return { limited: true, retryAfterSeconds: RATE_LIMITS.ipHourly.windowSeconds };
  }

  const installDailySince = now - RATE_LIMITS.installDaily.windowSeconds;
  const installDaily = await db
    .prepare(
      `SELECT COUNT(*) AS count FROM feedback_submissions
       WHERE install_id = ? AND created_at >= ?`
    )
    .bind(installId, installDailySince)
    .first<{ count: number }>();

  if ((installDaily?.count ?? 0) >= RATE_LIMITS.installDaily.max) {
    return { limited: true, retryAfterSeconds: RATE_LIMITS.installDaily.windowSeconds };
  }

  return { limited: false };
}
