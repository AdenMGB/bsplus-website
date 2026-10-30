import type { H3Event } from 'h3';
import { createApiEnvelope, createApiError } from './customThemes';
import { getDB } from './db';
import {
  FEEDBACK_BROWSERS,
  getClientIp,
  hashIp,
  isValidInstallId,
} from './feedback';
import { getOptionalUser } from './auth';
import { generateUUID } from './themes';
import {
  loadRemoteThemeDirectiveFromRow,
  parseRemoteThemeDirectiveInput,
  resolveSnapshotRemoteTheme,
  type RemoteThemeDirective,
} from './bsplusRemoteThemePackages';

export type { RemoteThemeDirective };

export const REMOTE_CONFIG_SNAPSHOT_MAX_BYTES = 32 * 1024;

export const FEATURE_MODES = [
  'allow',
  'hide',
  'banner',
  'block',
  'greyout',
  'temp_hide',
] as const;

export type FeatureMode = (typeof FEATURE_MODES)[number];

export const GLOBAL_MODES = ['on', 'off'] as const;

export type GlobalMode = (typeof GLOBAL_MODES)[number];

export const EXTENSION_CHANNELS = ['stable', 'dev', 'nightly', 'unknown'] as const;

export type RemoteConfigErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'PAYLOAD_TOO_LARGE';

export type RemoteConfigGlobal = {
  mode: GlobalMode;
  allowLocalOverride: boolean;
  statusMessage: string | null;
  maintenance: { title?: string; body?: string } | null;
  minExtensionVersion: string | null;
  forceUpdateUrl: string | null;
  disableCloudSync: boolean;
  disableThemeStore: boolean;
  disableFeedbackSubmit: boolean;
  hostnamePolicy: {
    mode?: 'allowlist' | 'denylist';
    suffixes?: string[];
  } | null;
};

export type RemoteConfigFeatureMessage = {
  title?: string;
  body: string;
  severity?: 'info' | 'warning' | 'error';
};

export type RemoteConfigFeature = {
  mode: FeatureMode;
  message?: RemoteConfigFeatureMessage;
};

export type RemoteConfigCampaign = {
  id: string;
  priority: number;
  activeFrom: string;
  activeTo: string;
  header: { title: string; subtitle?: string };
  hero?: { type: string; url: string; alt?: string };
  bodyHtml: string;
  buttons: Array<Record<string, unknown>>;
  requireAcknowledge: boolean;
  minVersion?: string | null;
  maxVersion?: string | null;
};

export type RemoteConfigSnapshotData = {
  configVersion: string;
  etag: string;
  source: 'api';
  global: RemoteConfigGlobal;
  features: Record<string, RemoteConfigFeature>;
  campaigns: RemoteConfigCampaign[];
  remoteTheme: RemoteThemeDirective | null;
};

const FEATURE_KEY_RE = /^(page|plugin|settings)\.[a-z0-9][a-z0-9._-]{0,126}$/i;
const HOSTNAME_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
const CAMPAIGN_ID_RE = /^[a-zA-Z0-9_-]{3,64}$/;

const ALLOWED_HTML_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'a',
  'h1',
  'h2',
  'h3',
  'h4',
  'span',
  'div',
  'img',
  'code',
  'pre',
  'blockquote',
]);

function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

function parseJsonObject(value: unknown): Record<string, unknown> | null {
  if (value == null || value === '') return null;
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value !== 'string') return null;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function boolFromDb(value: unknown, defaultValue = false): boolean {
  if (value === 1 || value === true) return true;
  if (value === 0 || value === false) return false;
  return defaultValue;
}

export function sendRemoteConfigError(
  event: H3Event,
  statusCode: number,
  message: string,
  code: RemoteConfigErrorCode,
  retryAfterSeconds?: number
) {
  setResponseStatus(event, statusCode);
  if (retryAfterSeconds !== undefined) {
    setResponseHeader(event, 'Retry-After', String(retryAfterSeconds));
  }
  return createApiError(code, message);
}

export function sanitizeCampaignBodyHtml(raw: string): string {
  let html = String(raw || '').trim();
  if (!html) return '';

  html = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');

  const tagRe = /<\/?([a-zA-Z0-9]+)([^>]*)>/g;
  html = html.replace(tagRe, (match, tagName: string, attrs: string) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_HTML_TAGS.has(tag)) {
      return '';
    }

    if (match.startsWith('</')) {
      return `</${tag}>`;
    }

    const safeAttrs: string[] = [];
    const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRe.exec(attrs)) !== null) {
      const name = attrMatch[1].toLowerCase();
      const val = attrMatch[3] ?? attrMatch[4] ?? attrMatch[5] ?? '';
      if (name === 'href' && !/^https?:\/\//i.test(val)) continue;
      if (name === 'src' && !/^https?:\/\//i.test(val)) continue;
      if (name.startsWith('on')) continue;
      if (['href', 'src', 'alt', 'title', 'class', 'target', 'rel'].includes(name)) {
        safeAttrs.push(`${name}="${val.replace(/"/g, '&quot;')}"`);
      }
    }

    if (tag === 'a' && !safeAttrs.some((a) => a.startsWith('rel='))) {
      safeAttrs.push('rel="noopener noreferrer"');
    }
    if (tag === 'a' && !safeAttrs.some((a) => a.startsWith('target='))) {
      safeAttrs.push('target="_blank"');
    }

    return `<${tag}${safeAttrs.length ? ` ${safeAttrs.join(' ')}` : ''}>`;
  });

  return html.trim();
}

export function isValidFeatureKey(key: string): boolean {
  return FEATURE_KEY_RE.test(key);
}

export function isValidHostnameOnly(value: string): boolean {
  const host = value.trim().toLowerCase();
  if (!host || host.length > 253) return false;
  if (host.includes('/') || host.includes(':') || host.includes('@')) return false;
  return HOSTNAME_RE.test(host);
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function computeConfigEtag(canonicalJson: string): Promise<string> {
  const hex = await sha256Hex(canonicalJson);
  return `W/"${hex.slice(0, 16)}"`;
}

function parseHostnamePolicy(value: unknown): RemoteConfigGlobal['hostnamePolicy'] {
  const obj = parseJsonObject(value);
  if (!obj) return null;
  const mode = obj.mode;
  if (mode !== 'allowlist' && mode !== 'denylist') return null;
  const suffixes = Array.isArray(obj.suffixes)
    ? obj.suffixes.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).map((s) => s.trim().toLowerCase())
    : [];
  if (!suffixes.length) return null;
  return { mode, suffixes };
}

function rowToGlobal(row: Record<string, unknown>): RemoteConfigGlobal {
  const maintenance = parseJsonObject(row.maintenance_json);
  return {
    mode: (row.mode === 'off' ? 'off' : 'on') as GlobalMode,
    allowLocalOverride: boolFromDb(row.allow_local_override, true),
    statusMessage: row.status_message ? String(row.status_message) : null,
    maintenance: maintenance
      ? {
          title: typeof maintenance.title === 'string' ? maintenance.title : undefined,
          body: typeof maintenance.body === 'string' ? maintenance.body : undefined,
        }
      : null,
    minExtensionVersion: row.min_extension_version
      ? String(row.min_extension_version)
      : null,
    forceUpdateUrl: row.force_update_url ? String(row.force_update_url) : null,
    disableCloudSync: boolFromDb(row.disable_cloud_sync),
    disableThemeStore: boolFromDb(row.disable_theme_store),
    disableFeedbackSubmit: boolFromDb(row.disable_feedback_submit),
    hostnamePolicy:
      parseHostnamePolicy(row.hostname_policy_json) ??
      parseHostnamePolicy(row.hostnamePolicy),
  };
}

function rowToFeature(row: Record<string, unknown>): RemoteConfigFeature {
  const messageObj = parseJsonObject(row.message_json);
  const feature: RemoteConfigFeature = {
    mode: row.mode as FeatureMode,
  };
  if (messageObj && typeof messageObj.body === 'string') {
    feature.message = {
      title: typeof messageObj.title === 'string' ? messageObj.title : undefined,
      body: messageObj.body,
      severity:
        messageObj.severity === 'warning' || messageObj.severity === 'error'
          ? messageObj.severity
          : messageObj.severity === 'info'
            ? 'info'
            : undefined,
    };
  }
  return feature;
}

export function campaignRowToPublic(
  row: Record<string, unknown>,
  options: { includeBody: boolean }
): RemoteConfigCampaign | null {
  const header = parseJsonObject(row.header_json);
  if (!header || typeof header.title !== 'string') return null;

  const buttons = parseJsonArray(row.buttons_json);
  const hero = parseJsonObject(row.hero_json);

  const campaign: RemoteConfigCampaign = {
    id: String(row.id),
    priority: Number(row.priority) || 0,
    activeFrom: String(row.active_from),
    activeTo: String(row.active_to),
    header: {
      title: header.title,
      subtitle: typeof header.subtitle === 'string' ? header.subtitle : undefined,
    },
    bodyHtml: options.includeBody ? String(row.body_html || '') : '',
    buttons: buttons as Array<Record<string, unknown>>,
    requireAcknowledge: boolFromDb(row.require_acknowledge),
  };

  if (row.min_version) campaign.minVersion = String(row.min_version);
  if (row.max_version) campaign.maxVersion = String(row.max_version);

  if (hero && typeof hero.type === 'string' && typeof hero.url === 'string') {
    campaign.hero = {
      type: hero.type,
      url: hero.url,
      alt: typeof hero.alt === 'string' ? hero.alt : undefined,
    };
  }

  return campaign;
}

function isCampaignActiveNow(campaign: RemoteConfigCampaign, nowMs = Date.now()): boolean {
  const from = Date.parse(campaign.activeFrom);
  const to = Date.parse(campaign.activeTo);
  if (Number.isNaN(from) || Number.isNaN(to)) return false;
  return nowMs >= from && nowMs <= to;
}

export async function loadDraftGlobal(db: any): Promise<RemoteConfigGlobal> {
  const row = await db
    .prepare('SELECT * FROM bsplus_remote_config_global WHERE id = 1')
    .first<Record<string, unknown>>();
  if (!row) {
    return {
      mode: 'on',
      allowLocalOverride: true,
      statusMessage: null,
      maintenance: null,
      minExtensionVersion: null,
      forceUpdateUrl: null,
      disableCloudSync: false,
      disableThemeStore: false,
      disableFeedbackSubmit: false,
      hostnamePolicy: null,
    };
  }
  return rowToGlobal(row);
}

export async function loadDraftFeatures(db: any): Promise<Record<string, RemoteConfigFeature>> {
  const result = await db.prepare('SELECT * FROM bsplus_remote_config_features ORDER BY feature_key').all();
  const features: Record<string, RemoteConfigFeature> = {};
  for (const row of (result.results || []) as Record<string, unknown>[]) {
    features[String(row.feature_key)] = rowToFeature(row);
  }
  return features;
}

/** Gates that actually restrict the extension (allow = omit from remote JSON). */
export function filterActiveFeatureGates(
  features: Record<string, RemoteConfigFeature>
): Record<string, RemoteConfigFeature> {
  const out: Record<string, RemoteConfigFeature> = {};
  for (const [key, gate] of Object.entries(features)) {
    if (!gate.mode || gate.mode === 'allow') continue;
    const entry: RemoteConfigFeature = { mode: gate.mode };
    if (gate.message?.body) {
      entry.message = gate.message;
    }
    out[key] = entry;
  }
  return out;
}

/** GitHub / fallback JSON: drop cleared optional global fields. */
export function compactGlobalForExport(global: RemoteConfigGlobal): Record<string, unknown> {
  const out: Record<string, unknown> = {
    mode: global.mode === 'off' ? 'off' : 'on',
  };
  if (global.allowLocalOverride === false) {
    out.allowLocalOverride = false;
  }
  if (global.statusMessage) {
    out.statusMessage = global.statusMessage;
  }
  if (global.maintenance?.title || global.maintenance?.body) {
    out.maintenance = global.maintenance;
  }
  if (global.minExtensionVersion) {
    out.minExtensionVersion = global.minExtensionVersion;
  }
  if (global.forceUpdateUrl) {
    out.forceUpdateUrl = global.forceUpdateUrl;
  }
  if (global.hostnamePolicy?.suffixes?.length) {
    out.hostnamePolicy = global.hostnamePolicy;
  }
  if (global.disableCloudSync) out.disableCloudSync = true;
  if (global.disableThemeStore) out.disableThemeStore = true;
  if (global.disableFeedbackSubmit) out.disableFeedbackSubmit = true;
  return out;
}

export async function loadCampaignRows(db: any): Promise<Record<string, unknown>[]> {
  const result = await db
    .prepare(
      `SELECT * FROM bsplus_remote_config_campaigns
       WHERE enabled = 1
       ORDER BY priority DESC, updated_at DESC`
    )
    .all();
  return (result.results || []) as Record<string, unknown>[];
}

/** Campaign list for published API snapshot (active window, optional body trim). */
export async function buildSnapshotCampaigns(
  db: any,
  options: { activeOnly?: boolean } = {}
): Promise<RemoteConfigCampaign[]> {
  const activeOnly = options.activeOnly !== false;
  const campaigns: RemoteConfigCampaign[] = [];

  for (const row of await loadCampaignRows(db)) {
    const includeBodyInRow = !boolFromDb(row.omit_body_from_snapshot);
    const campaign = campaignRowToPublic(row, { includeBody: true });
    if (!campaign) continue;
    if (activeOnly && !isCampaignActiveNow(campaign)) continue;
    if (!includeBodyInRow) {
      campaign.bodyHtml = '';
    }
    campaigns.push(campaign);
  }

  return campaigns;
}

export async function loadDraftRemoteThemeDirective(db: any): Promise<RemoteThemeDirective | null> {
  const row = await db
    .prepare('SELECT remote_theme_json FROM bsplus_remote_config_global WHERE id = 1')
    .first<Record<string, unknown>>();
  if (!row) return null;
  return loadRemoteThemeDirectiveFromRow(row);
}

export async function patchRemoteThemeDirective(
  db: any,
  body: Record<string, unknown>
): Promise<RemoteThemeDirective | null> {
  if (!('remoteTheme' in body)) {
    return loadDraftRemoteThemeDirective(db);
  }

  const directive =
    body.remoteTheme === null
      ? null
      : parseRemoteThemeDirectiveInput(body.remoteTheme);

  if (body.remoteTheme !== null && !directive) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid remoteTheme directive' });
  }

  const updatedAt = nowUnix();
  await db
    .prepare('UPDATE bsplus_remote_config_global SET remote_theme_json = ?, updated_at = ? WHERE id = 1')
    .bind(directive ? JSON.stringify(directive) : null, updatedAt)
    .run();

  return directive;
}

export async function buildSnapshotPayload(
  db: any,
  configVersion: string,
  etag: string
): Promise<RemoteConfigSnapshotData> {
  const global = await loadDraftGlobal(db);
  const features = filterActiveFeatureGates(await loadDraftFeatures(db));
  let campaigns = await buildSnapshotCampaigns(db, { activeOnly: true });
  const remoteTheme = await resolveSnapshotRemoteTheme(db, await loadDraftRemoteThemeDirective(db));

  let payload: RemoteConfigSnapshotData = {
    configVersion,
    etag,
    source: 'api',
    global,
    features,
    campaigns,
    remoteTheme,
  };

  let json = JSON.stringify(payload);
  if (json.length > REMOTE_CONFIG_SNAPSHOT_MAX_BYTES) {
    campaigns = campaigns.map((c) => ({ ...c, bodyHtml: '' }));
    payload = { ...payload, campaigns };
    json = JSON.stringify(payload);
  }

  if (json.length > REMOTE_CONFIG_SNAPSHOT_MAX_BYTES) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Remote config snapshot exceeds 32 KB even after trimming campaign bodies',
    });
  }

  return payload;
}

export async function publishRemoteConfig(db: any): Promise<RemoteConfigSnapshotData> {
  const configVersion = new Date().toISOString();
  const tempEtag = 'W/"pending"';
  const payload = await buildSnapshotPayload(db, configVersion, tempEtag);
  const canonical = JSON.stringify({
    configVersion: payload.configVersion,
    global: payload.global,
    features: payload.features,
    campaigns: payload.campaigns,
    remoteTheme: payload.remoteTheme,
  });
  const etag = await computeConfigEtag(canonical);
  payload.etag = etag;

  const snapshotJson = JSON.stringify(payload);
  const publishedAt = nowUnix();

  await db
    .prepare(
      `UPDATE bsplus_remote_config_meta
       SET config_version = ?, etag = ?, published_at = ?, snapshot_json = ?
       WHERE id = 1`
    )
    .bind(configVersion, etag, publishedAt, snapshotJson)
    .run();

  return payload;
}

export async function getPublishedSnapshot(db: any): Promise<RemoteConfigSnapshotData | null> {
  const row = await db
    .prepare('SELECT snapshot_json, etag, config_version FROM bsplus_remote_config_meta WHERE id = 1')
    .first<{ snapshot_json: string; etag: string; config_version: string }>();

  if (!row?.snapshot_json) return null;

  try {
    const parsed = JSON.parse(row.snapshot_json) as RemoteConfigSnapshotData;
    parsed.etag = row.etag || parsed.etag;
    parsed.configVersion = row.config_version || parsed.configVersion;
    parsed.source = 'api';
    if (parsed.remoteTheme === undefined) {
      parsed.remoteTheme = null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function ensurePublishedSnapshot(db: any): Promise<RemoteConfigSnapshotData> {
  const existing = await getPublishedSnapshot(db);
  if (existing && existing.configVersion !== '1970-01-01T00:00:00.000Z') {
    return filterActiveCampaigns(existing);
  }
  const published = await publishRemoteConfig(db);
  return filterActiveCampaigns(published);
}

function filterActiveCampaigns(data: RemoteConfigSnapshotData): RemoteConfigSnapshotData {
  return {
    ...data,
    campaigns: data.campaigns.filter((c) => isCampaignActiveNow(c)),
  };
}

export async function getCampaignById(db: any, id: string): Promise<RemoteConfigCampaign | null> {
  const row = await db
    .prepare('SELECT * FROM bsplus_remote_config_campaigns WHERE id = ? AND enabled = 1')
    .bind(id)
    .first<Record<string, unknown>>();
  if (!row) return null;
  return campaignRowToPublic(row, { includeBody: true });
}

const RATE_LIMITS = {
  remoteConfigPerIp: { windowSeconds: 3600, max: 600 },
  registerPerInstall: { windowSeconds: 3600, max: 120 },
  registerPerIp: { windowSeconds: 3600, max: 300 },
};

async function incrementRateBucket(
  db: any,
  bucketKey: string,
  windowSeconds: number
): Promise<number> {
  const now = nowUnix();
  const row = await db
    .prepare('SELECT window_start, hit_count FROM bsplus_remote_config_rate WHERE bucket_key = ?')
    .bind(bucketKey)
    .first<{ window_start: number; hit_count: number }>();

  if (!row || now - row.window_start >= windowSeconds) {
    await db
      .prepare(
        `INSERT INTO bsplus_remote_config_rate (bucket_key, window_start, hit_count)
         VALUES (?, ?, 1)
         ON CONFLICT(bucket_key) DO UPDATE SET window_start = excluded.window_start, hit_count = 1`
      )
      .bind(bucketKey, now)
      .run();
    return 1;
  }

  const next = row.hit_count + 1;
  await db
    .prepare('UPDATE bsplus_remote_config_rate SET hit_count = ? WHERE bucket_key = ?')
    .bind(next, bucketKey)
    .run();
  return next;
}

export async function checkRemoteConfigGetRateLimit(
  db: any,
  event: H3Event
): Promise<{ limited: false } | { limited: true; retryAfterSeconds: number }> {
  const config = useRuntimeConfig(event);
  const salt = (config.feedbackIpSalt as string) || 'bsplus-feedback-ip-salt-v1';
  const ipHash = await hashIp(getClientIp(event), salt);
  const count = await incrementRateBucket(
    db,
    `rc:ip:${ipHash}`,
    RATE_LIMITS.remoteConfigPerIp.windowSeconds
  );
  if (count > RATE_LIMITS.remoteConfigPerIp.max) {
    return { limited: true, retryAfterSeconds: RATE_LIMITS.remoteConfigPerIp.windowSeconds };
  }
  return { limited: false };
}

export async function checkInstallRegisterRateLimit(
  db: any,
  event: H3Event,
  installId: string
): Promise<{ limited: false } | { limited: true; retryAfterSeconds: number }> {
  const config = useRuntimeConfig(event);
  const salt = (config.feedbackIpSalt as string) || 'bsplus-feedback-ip-salt-v1';
  const ipHash = await hashIp(getClientIp(event), salt);

  const installCount = await incrementRateBucket(
    db,
    `reg:install:${installId}`,
    RATE_LIMITS.registerPerInstall.windowSeconds
  );
  if (installCount > RATE_LIMITS.registerPerInstall.max) {
    return { limited: true, retryAfterSeconds: RATE_LIMITS.registerPerInstall.windowSeconds };
  }

  const ipCount = await incrementRateBucket(
    db,
    `reg:ip:${ipHash}`,
    RATE_LIMITS.registerPerIp.windowSeconds
  );
  if (ipCount > RATE_LIMITS.registerPerIp.max) {
    return { limited: true, retryAfterSeconds: RATE_LIMITS.registerPerIp.windowSeconds };
  }

  return { limited: false };
}

export function validateRemoteConfigQuery(query: Record<string, unknown>): {
  ok: true;
  installId: string;
  extensionVersion: string;
  channel: string;
  hostname: string | null;
} | { ok: false; error: string } {
  const installIdRaw = typeof query.installId === 'string' ? query.installId.trim() : '';
  if (!isValidInstallId(installIdRaw)) {
    return { ok: false, error: 'installId is required and must be a valid RFC 4122 UUID' };
  }

  const extensionVersion =
    typeof query.extensionVersion === 'string' ? query.extensionVersion.trim() : '';
  if (!extensionVersion || extensionVersion.length > 32) {
    return { ok: false, error: 'extensionVersion is required (max 32 characters)' };
  }

  let channel = typeof query.channel === 'string' ? query.channel.trim() : 'unknown';
  if (!EXTENSION_CHANNELS.includes(channel as (typeof EXTENSION_CHANNELS)[number])) {
    channel = 'unknown';
  }

  let hostname: string | null = null;
  if (typeof query.hostname === 'string' && query.hostname.trim()) {
    if (!isValidHostnameOnly(query.hostname)) {
      return { ok: false, error: 'hostname must be a valid hostname without path' };
    }
    hostname = query.hostname.trim().toLowerCase();
  }

  return {
    ok: true,
    installId: installIdRaw.toLowerCase(),
    extensionVersion,
    channel,
    hostname,
  };
}

export type RegisterInstallPayload = {
  installId: string;
  extension: { version: string; channel?: string; browser: string };
  userId?: string | null;
  lastSeenAt?: string | null;
  hostname?: string | null;
};

export function validateRegisterPayload(body: unknown): { ok: true; data: RegisterInstallPayload } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const record = body as Record<string, unknown>;
  const installIdRaw = typeof record.installId === 'string' ? record.installId.trim() : '';
  if (!isValidInstallId(installIdRaw)) {
    return { ok: false, error: 'installId must be a valid RFC 4122 UUID' };
  }

  if (!record.extension || typeof record.extension !== 'object') {
    return { ok: false, error: 'extension object is required' };
  }
  const ext = record.extension as Record<string, unknown>;
  const version = typeof ext.version === 'string' ? ext.version.trim() : '';
  if (!version || version.length > 32) {
    return { ok: false, error: 'extension.version is required (max 32 characters)' };
  }
  const browser = typeof ext.browser === 'string' ? ext.browser.trim() : '';
  if (!browser || !FEEDBACK_BROWSERS.includes(browser as (typeof FEEDBACK_BROWSERS)[number])) {
    return { ok: false, error: `extension.browser must be one of: ${FEEDBACK_BROWSERS.join(', ')}` };
  }
  let channel = typeof ext.channel === 'string' ? ext.channel.trim() : 'unknown';
  if (!EXTENSION_CHANNELS.includes(channel as (typeof EXTENSION_CHANNELS)[number])) {
    channel = 'unknown';
  }

  let userId: string | null = null;
  if (record.userId !== undefined && record.userId !== null && record.userId !== '') {
    if (typeof record.userId !== 'string' || !isValidInstallId(record.userId)) {
      return { ok: false, error: 'userId must be a valid UUID when provided' };
    }
    userId = record.userId.trim().toLowerCase();
  }

  let hostname: string | null = null;
  if (typeof record.hostname === 'string' && record.hostname.trim()) {
    if (!isValidHostnameOnly(record.hostname)) {
      return { ok: false, error: 'hostname must be a valid hostname without path' };
    }
    hostname = record.hostname.trim().toLowerCase();
  }

  let lastSeenAt: string | null = null;
  if (typeof record.lastSeenAt === 'string' && record.lastSeenAt.trim()) {
    if (Number.isNaN(Date.parse(record.lastSeenAt))) {
      return { ok: false, error: 'lastSeenAt must be a valid ISO-8601 timestamp' };
    }
    lastSeenAt = record.lastSeenAt.trim();
  }

  return {
    ok: true,
    data: {
      installId: installIdRaw.toLowerCase(),
      extension: { version, channel, browser },
      userId,
      lastSeenAt,
      hostname,
    },
  };
}

export async function registerBsplusInstall(
  db: any,
  payload: RegisterInstallPayload,
  resolvedUserId: string | null
): Promise<void> {
  const now = payload.lastSeenAt ? Math.floor(Date.parse(payload.lastSeenAt) / 1000) : nowUnix();
  const userId = resolvedUserId ?? payload.userId ?? null;

  await db
    .prepare(
      `INSERT INTO bsplus_installs (
         install_id, user_id, extension_version, channel, browser, hostname, first_seen_at, last_seen_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(install_id) DO UPDATE SET
         user_id = COALESCE(excluded.user_id, bsplus_installs.user_id),
         extension_version = excluded.extension_version,
         channel = excluded.channel,
         browser = excluded.browser,
         hostname = COALESCE(excluded.hostname, bsplus_installs.hostname),
         last_seen_at = excluded.last_seen_at`
    )
    .bind(
      payload.installId,
      userId,
      payload.extension.version,
      payload.extension.channel ?? 'unknown',
      payload.extension.browser,
      payload.hostname,
      now,
      now
    )
    .run();
}

export async function resolveRegisterUserId(
  event: H3Event,
  bodyUserId: string | null | undefined
): Promise<string | null> {
  const sessionUser = await getOptionalUser(event);
  if (sessionUser?.id) {
    return sessionUser.id;
  }
  return bodyUserId ?? null;
}

export async function getInstallStats(db: any) {
  const now = nowUnix();
  const dayAgo = now - 86400;
  const weekAgo = now - 7 * 86400;

  const total = await db
    .prepare('SELECT COUNT(*) AS count FROM bsplus_installs')
    .first<{ count: number }>();
  const active24h = await db
    .prepare('SELECT COUNT(*) AS count FROM bsplus_installs WHERE last_seen_at >= ?')
    .bind(dayAgo)
    .first<{ count: number }>();
  const active7d = await db
    .prepare('SELECT COUNT(*) AS count FROM bsplus_installs WHERE last_seen_at >= ?')
    .bind(weekAgo)
    .first<{ count: number }>();
  const withUser = await db
    .prepare('SELECT COUNT(*) AS count FROM bsplus_installs WHERE user_id IS NOT NULL')
    .bind()
    .first<{ count: number }>();

  return {
    total_installs: total?.count ?? 0,
    active_last_24h: active24h?.count ?? 0,
    active_last_7d: active7d?.count ?? 0,
    installs_with_cloud_user: withUser?.count ?? 0,
  };
}

export function parseFeatureMessageInput(value: unknown): RemoteConfigFeatureMessage | null {
  const obj = parseJsonObject(value);
  if (!obj || typeof obj.body !== 'string' || !obj.body.trim()) return null;
  const message: RemoteConfigFeatureMessage = { body: obj.body.trim() };
  if (typeof obj.title === 'string') message.title = obj.title.trim();
  if (obj.severity === 'info' || obj.severity === 'warning' || obj.severity === 'error') {
    message.severity = obj.severity;
  }
  return message;
}

export function validateFeatureInput(body: Record<string, unknown>): {
  ok: true;
  featureKey: string;
  mode: FeatureMode;
  message: RemoteConfigFeatureMessage | null;
} | { ok: false; error: string } {
  const featureKey =
    (typeof body.feature_key === 'string' ? body.feature_key : typeof body.featureKey === 'string' ? body.featureKey : '')
      .trim();
  if (!isValidFeatureKey(featureKey)) {
    return {
      ok: false,
      error: 'feature_key must match page.*, plugin.*, or settings.*',
    };
  }
  const mode = typeof body.mode === 'string' ? body.mode.trim() : '';
  if (!FEATURE_MODES.includes(mode as FeatureMode)) {
    return { ok: false, error: `mode must be one of: ${FEATURE_MODES.join(', ')}` };
  }
  const message =
    body.message === undefined || body.message === null
      ? null
      : parseFeatureMessageInput(body.message);
  if (body.message != null && !message) {
    return { ok: false, error: 'message requires a non-empty body string' };
  }
  return { ok: true, featureKey, mode: mode as FeatureMode, message };
}

export function normalizeCampaignId(raw: string): string {
  return raw.trim();
}

export function isValidCampaignId(id: string): boolean {
  return CAMPAIGN_ID_RE.test(id);
}

export function newCampaignId(): string {
  return `camp_${generateUUID().replace(/-/g, '').slice(0, 20)}`;
}

export async function patchGlobalSettings(db: any, body: Record<string, unknown>) {
  const current = await loadDraftGlobal(db);
  const next: RemoteConfigGlobal = { ...current };

  if (typeof body.mode === 'string' && GLOBAL_MODES.includes(body.mode as GlobalMode)) {
    next.mode = body.mode as GlobalMode;
  }
  if (typeof body.allowLocalOverride === 'boolean') {
    next.allowLocalOverride = body.allowLocalOverride;
  }
  if (body.statusMessage !== undefined) {
    next.statusMessage =
      body.statusMessage === null || body.statusMessage === ''
        ? null
        : String(body.statusMessage).slice(0, 500);
  }
  if (body.maintenance !== undefined) {
    if (body.maintenance === null) {
      next.maintenance = null;
    } else {
      const m = parseJsonObject(body.maintenance);
      next.maintenance = m
        ? {
            title: typeof m.title === 'string' ? m.title.slice(0, 200) : undefined,
            body: typeof m.body === 'string' ? m.body.slice(0, 2000) : undefined,
          }
        : null;
    }
  }
  if (body.hostnamePolicy !== undefined) {
    next.hostnamePolicy =
      body.hostnamePolicy === null ? null : parseHostnamePolicy(body.hostnamePolicy);
  }
  if (body.minExtensionVersion !== undefined) {
    next.minExtensionVersion =
      body.minExtensionVersion === null || body.minExtensionVersion === ''
        ? null
        : String(body.minExtensionVersion).slice(0, 32);
  }
  if (body.forceUpdateUrl !== undefined) {
    next.forceUpdateUrl =
      body.forceUpdateUrl === null || body.forceUpdateUrl === ''
        ? null
        : String(body.forceUpdateUrl).slice(0, 500);
  }
  if (typeof body.disableCloudSync === 'boolean') next.disableCloudSync = body.disableCloudSync;
  if (typeof body.disableThemeStore === 'boolean') next.disableThemeStore = body.disableThemeStore;
  if (typeof body.disableFeedbackSubmit === 'boolean') {
    next.disableFeedbackSubmit = body.disableFeedbackSubmit;
  }

  const updatedAt = nowUnix();
  await db
    .prepare(
      `UPDATE bsplus_remote_config_global SET
         mode = ?,
         allow_local_override = ?,
         status_message = ?,
         maintenance_json = ?,
         min_extension_version = ?,
         force_update_url = ?,
         disable_cloud_sync = ?,
         disable_theme_store = ?,
         disable_feedback_submit = ?,
         hostname_policy_json = ?,
         updated_at = ?
       WHERE id = 1`
    )
    .bind(
      next.mode,
      next.allowLocalOverride ? 1 : 0,
      next.statusMessage,
      next.maintenance ? JSON.stringify(next.maintenance) : null,
      next.minExtensionVersion,
      next.forceUpdateUrl,
      next.disableCloudSync ? 1 : 0,
      next.disableThemeStore ? 1 : 0,
      next.disableFeedbackSubmit ? 1 : 0,
      next.hostnamePolicy ? JSON.stringify(next.hostnamePolicy) : null,
      updatedAt
    )
    .run();

  return next;
}

export async function upsertFeatureGate(
  db: any,
  featureKey: string,
  mode: FeatureMode,
  message: RemoteConfigFeatureMessage | null
) {
  if (mode === 'allow') {
    await deleteFeatureGate(db, featureKey);
    return;
  }

  const updatedAt = nowUnix();
  await db
    .prepare(
      `INSERT INTO bsplus_remote_config_features (feature_key, mode, message_json, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(feature_key) DO UPDATE SET
         mode = excluded.mode,
         message_json = excluded.message_json,
         updated_at = excluded.updated_at`
    )
    .bind(featureKey, mode, message ? JSON.stringify(message) : null, updatedAt)
    .run();
}

export async function deleteFeatureGate(db: any, featureKey: string): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM bsplus_remote_config_features WHERE feature_key = ?')
    .bind(featureKey)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

export async function listAdminCampaignRows(db: any) {
  const result = await db
    .prepare('SELECT * FROM bsplus_remote_config_campaigns ORDER BY priority DESC, updated_at DESC')
    .all();
  return (result.results || []) as Record<string, unknown>[];
}

export function mapAdminCampaignRow(row: Record<string, unknown>) {
  const campaign = campaignRowToPublic(row, { includeBody: true });
  return {
    ...campaign,
    enabled: boolFromDb(row.enabled, true),
    omitBodyFromSnapshot: boolFromDb(row.omit_body_from_snapshot),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function createCampaign(db: any, body: Record<string, unknown>) {
  const idRaw =
    typeof body.id === 'string' && body.id.trim() ? normalizeCampaignId(body.id) : newCampaignId();
  if (!isValidCampaignId(idRaw)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid campaign id' });
  }

  const header = parseJsonObject(body.header);
  if (!header || typeof header.title !== 'string' || !header.title.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'header.title is required' });
  }

  const activeFrom = typeof body.activeFrom === 'string' ? body.activeFrom : typeof body.active_from === 'string' ? body.active_from : '';
  const activeTo = typeof body.activeTo === 'string' ? body.activeTo : typeof body.active_to === 'string' ? body.active_to : '';
  if (!activeFrom || Number.isNaN(Date.parse(activeFrom)) || !activeTo || Number.isNaN(Date.parse(activeTo))) {
    throw createError({ statusCode: 400, statusMessage: 'activeFrom and activeTo must be valid ISO-8601 timestamps' });
  }

  const bodyHtml = sanitizeCampaignBodyHtml(
    typeof body.bodyHtml === 'string' ? body.bodyHtml : typeof body.body_html === 'string' ? body.body_html : ''
  );
  const buttons = parseJsonArray(body.buttons);
  const hero = body.hero === undefined || body.hero === null ? null : parseJsonObject(body.hero);
  const priority = Number(body.priority) || 0;
  const requireAcknowledge = body.requireAcknowledge === true || body.require_acknowledge === true;
  const omitBody = body.omitBodyFromSnapshot === true || body.omit_body_from_snapshot === true;
  const enabled = body.enabled !== false;
  const minVersion =
    typeof body.minVersion === 'string' && body.minVersion.trim()
      ? body.minVersion.trim().slice(0, 32)
      : typeof body.min_version === 'string' && body.min_version.trim()
        ? body.min_version.trim().slice(0, 32)
        : null;
  const maxVersion =
    typeof body.maxVersion === 'string' && body.maxVersion.trim()
      ? body.maxVersion.trim().slice(0, 32)
      : typeof body.max_version === 'string' && body.max_version.trim()
        ? body.max_version.trim().slice(0, 32)
        : null;
  const now = nowUnix();

  await db
    .prepare(
      `INSERT INTO bsplus_remote_config_campaigns (
         id, priority, active_from, active_to, header_json, hero_json, body_html, buttons_json,
         require_acknowledge, omit_body_from_snapshot, enabled, min_version, max_version,
         created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      idRaw,
      priority,
      activeFrom,
      activeTo,
      JSON.stringify({ title: header.title.trim(), subtitle: header.subtitle }),
      hero ? JSON.stringify(hero) : null,
      bodyHtml,
      JSON.stringify(buttons),
      requireAcknowledge ? 1 : 0,
      omitBody ? 1 : 0,
      enabled ? 1 : 0,
      minVersion,
      maxVersion,
      now,
      now
    )
    .run();

  const row = await db
    .prepare('SELECT * FROM bsplus_remote_config_campaigns WHERE id = ?')
    .bind(idRaw)
    .first<Record<string, unknown>>();
  return mapAdminCampaignRow(row!);
}

export async function updateCampaign(db: any, id: string, body: Record<string, unknown>) {
  const existing = await db
    .prepare('SELECT * FROM bsplus_remote_config_campaigns WHERE id = ?')
    .bind(id)
    .first<Record<string, unknown>>();
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Campaign not found' });
  }

  const headerExisting = parseJsonObject(existing.header_json) || { title: '' };
  const headerInput = body.header !== undefined ? parseJsonObject(body.header) : headerExisting;
  if (!headerInput || typeof headerInput.title !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'header.title is required' });
  }

  const activeFrom =
    typeof body.activeFrom === 'string'
      ? body.activeFrom
      : typeof body.active_from === 'string'
        ? body.active_from
        : String(existing.active_from);
  const activeTo =
    typeof body.activeTo === 'string'
      ? body.activeTo
      : typeof body.active_to === 'string'
        ? body.active_to
        : String(existing.active_to);

  const bodyHtml =
    body.bodyHtml !== undefined || body.body_html !== undefined
      ? sanitizeCampaignBodyHtml(
          typeof body.bodyHtml === 'string'
            ? body.bodyHtml
            : typeof body.body_html === 'string'
              ? body.body_html
              : ''
        )
      : String(existing.body_html || '');

  const buttons =
    body.buttons !== undefined ? parseJsonArray(body.buttons) : parseJsonArray(existing.buttons_json);
  const hero =
    body.hero !== undefined
      ? body.hero === null
        ? null
        : parseJsonObject(body.hero)
      : parseJsonObject(existing.hero_json);
  const priority = body.priority !== undefined ? Number(body.priority) || 0 : Number(existing.priority) || 0;
  const requireAcknowledge =
    body.requireAcknowledge !== undefined
      ? body.requireAcknowledge === true
      : boolFromDb(existing.require_acknowledge);
  const omitBody =
    body.omitBodyFromSnapshot !== undefined
      ? body.omitBodyFromSnapshot === true
      : boolFromDb(existing.omit_body_from_snapshot);
  const enabled = body.enabled !== undefined ? body.enabled !== false : boolFromDb(existing.enabled, true);
  const minVersion =
    body.minVersion !== undefined || body.min_version !== undefined
      ? typeof body.minVersion === 'string' && body.minVersion.trim()
        ? body.minVersion.trim().slice(0, 32)
        : typeof body.min_version === 'string' && body.min_version.trim()
          ? body.min_version.trim().slice(0, 32)
          : null
      : existing.min_version
        ? String(existing.min_version)
        : null;
  const maxVersion =
    body.maxVersion !== undefined || body.max_version !== undefined
      ? typeof body.maxVersion === 'string' && body.maxVersion.trim()
        ? body.maxVersion.trim().slice(0, 32)
        : typeof body.max_version === 'string' && body.max_version.trim()
          ? body.max_version.trim().slice(0, 32)
          : null
      : existing.max_version
        ? String(existing.max_version)
        : null;
  const updatedAt = nowUnix();

  await db
    .prepare(
      `UPDATE bsplus_remote_config_campaigns SET
         priority = ?, active_from = ?, active_to = ?, header_json = ?, hero_json = ?,
         body_html = ?, buttons_json = ?, require_acknowledge = ?, omit_body_from_snapshot = ?,
         enabled = ?, min_version = ?, max_version = ?, updated_at = ?
       WHERE id = ?`
    )
    .bind(
      priority,
      activeFrom,
      activeTo,
      JSON.stringify({ title: headerInput.title, subtitle: headerInput.subtitle }),
      hero ? JSON.stringify(hero) : null,
      bodyHtml,
      JSON.stringify(buttons),
      requireAcknowledge ? 1 : 0,
      omitBody ? 1 : 0,
      enabled ? 1 : 0,
      minVersion,
      maxVersion,
      updatedAt,
      id
    )
    .run();

  const row = await db
    .prepare('SELECT * FROM bsplus_remote_config_campaigns WHERE id = ?')
    .bind(id)
    .first<Record<string, unknown>>();
  return mapAdminCampaignRow(row!);
}

export async function deleteCampaign(db: any, id: string): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM bsplus_remote_config_campaigns WHERE id = ?')
    .bind(id)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

export async function getPublishedMeta(db: any) {
  return db
    .prepare('SELECT config_version, etag, published_at FROM bsplus_remote_config_meta WHERE id = 1')
    .first<{ config_version: string; etag: string; published_at: number }>();
}

export { createApiEnvelope };
