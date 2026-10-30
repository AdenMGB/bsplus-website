import type { H3Event } from 'h3';
import { createApiError, createApiEnvelope } from './customThemes';
import { getBucket } from './r2';
import { getPublicApiUrl } from './publicApi';

export const REMOTE_THEME_PACKAGE_ID_RE = /^[a-z0-9][a-z0-9-]{2,62}$/;
export const REMOTE_THEME_MODES = ['off', 'optional', 'forced'] as const;
export type RemoteThemeMode = (typeof REMOTE_THEME_MODES)[number];

const PACKAGE_QUERY_CHANNELS = ['stable', 'dev', 'nightly', 'unknown'] as const;
const HOSTNAME_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;

function isValidHostnameOnly(value: string): boolean {
  const host = value.trim().toLowerCase();
  if (!host || host.length > 253) return false;
  if (host.includes('/') || host.includes(':') || host.includes('@')) return false;
  return HOSTNAME_RE.test(host);
}

export type RemoteThemeMessage = {
  title?: string;
  body: string;
};

export type RemoteThemeDirective = {
  packageId?: string;
  packageVersion?: string;
  mode?: RemoteThemeMode;
  activeFrom?: string;
  activeTo?: string;
  message?: RemoteThemeMessage;
  allowUserOptOut?: boolean;
};

export type RemoteThemePackageRow = {
  package_id: string;
  version: string;
  theme_json: string | null;
  bundle_r2_key: string | null;
  sha256: string | null;
  enabled: number;
  created_at: number;
  updated_at: number;
};

const R2_PREFIX = 'remote-theme-packages';
const INLINE_THEME_MAX_BYTES = 24 * 1024;

export function isValidRemoteThemePackageId(id: string): boolean {
  return REMOTE_THEME_PACKAGE_ID_RE.test(id.trim());
}

function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

async function sha256HexBytes(bytes: ArrayBuffer | Uint8Array): Promise<string> {
  const buffer = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function parseRemoteThemeDirectiveInput(value: unknown): RemoteThemeDirective | null {
  if (value === null || value === undefined) return null;
  const obj =
    typeof value === 'object' && value && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  if (!obj) return null;

  let mode: RemoteThemeMode | undefined;
  if (typeof obj.mode === 'string' && REMOTE_THEME_MODES.includes(obj.mode as RemoteThemeMode)) {
    mode = obj.mode as RemoteThemeMode;
  }

  const directive: RemoteThemeDirective = {};
  if (mode) directive.mode = mode;

  if (typeof obj.packageId === 'string' && obj.packageId.trim()) {
    directive.packageId = obj.packageId.trim();
  }
  if (typeof obj.packageVersion === 'string' && obj.packageVersion.trim()) {
    directive.packageVersion = obj.packageVersion.trim().slice(0, 32);
  }

  if (typeof obj.activeFrom === 'string' && obj.activeFrom.trim()) {
    if (Number.isNaN(Date.parse(obj.activeFrom))) return null;
    directive.activeFrom = obj.activeFrom.trim();
  }
  if (typeof obj.activeTo === 'string' && obj.activeTo.trim()) {
    if (Number.isNaN(Date.parse(obj.activeTo))) return null;
    directive.activeTo = obj.activeTo.trim();
  }

  if (obj.message !== undefined && obj.message !== null) {
    const m =
      typeof obj.message === 'object' && obj.message
        ? (obj.message as Record<string, unknown>)
        : null;
    if (!m || typeof m.body !== 'string' || !m.body.trim()) return null;
    directive.message = {
      body: m.body.trim(),
      title: typeof m.title === 'string' ? m.title.trim() : undefined,
    };
  }

  if (typeof obj.allowUserOptOut === 'boolean') {
    directive.allowUserOptOut = obj.allowUserOptOut;
  }

  if (directive.mode === 'off') {
    return { mode: 'off' };
  }

  if (!directive.mode && !directive.packageId) {
    return null;
  }

  if (directive.mode && directive.mode !== 'off') {
    if (!directive.packageId || !isValidRemoteThemePackageId(directive.packageId)) {
      return null;
    }
  }

  return directive;
}

export function loadRemoteThemeDirectiveFromRow(row: Record<string, unknown>): RemoteThemeDirective | null {
  const raw = row.remote_theme_json;
  if (raw == null || raw === '') return null;
  if (typeof raw === 'string') {
    try {
      return parseRemoteThemeDirectiveInput(JSON.parse(raw));
    } catch {
      return null;
    }
  }
  return parseRemoteThemeDirectiveInput(raw);
}

export function isRemoteThemeDirectiveActive(
  directive: RemoteThemeDirective,
  nowMs = Date.now()
): boolean {
  if (directive.mode === 'off') return true;
  if (directive.activeFrom) {
    const from = Date.parse(directive.activeFrom);
    if (!Number.isNaN(from) && nowMs < from) return false;
  }
  if (directive.activeTo) {
    const to = Date.parse(directive.activeTo);
    if (!Number.isNaN(to) && nowMs > to) return false;
  }
  return true;
}

export async function resolveSnapshotRemoteTheme(
  db: any,
  directive: RemoteThemeDirective | null
): Promise<RemoteThemeDirective | null> {
  if (!directive) return null;
  if (directive.mode === 'off') {
    return { mode: 'off' };
  }
  if (!isRemoteThemeDirectiveActive(directive)) {
    return null;
  }
  if (!directive.packageId || !directive.mode) return null;

  const pkg = await db
    .prepare(
      'SELECT package_id, version, enabled FROM bsplus_remote_theme_packages WHERE package_id = ?'
    )
    .bind(directive.packageId)
    .first<{ package_id: string; version: string; enabled: number }>();

  if (!pkg || !pkg.enabled) return null;

  const out: RemoteThemeDirective = {
    packageId: directive.packageId,
    packageVersion: directive.packageVersion ?? String(pkg.version),
    mode: directive.mode,
  };
  if (directive.activeFrom) out.activeFrom = directive.activeFrom;
  if (directive.activeTo) out.activeTo = directive.activeTo;
  if (directive.message) out.message = directive.message;
  if (directive.allowUserOptOut === true) out.allowUserOptOut = true;
  return out;
}

export function validateRemoteThemePackageQuery(query: Record<string, unknown>): {
  ok: true;
  extensionVersion: string;
  channel: string;
  hostname: string | null;
} | { ok: false; error: string } {
  const extensionVersion =
    typeof query.extensionVersion === 'string' ? query.extensionVersion.trim() : '';
  if (!extensionVersion || extensionVersion.length > 32) {
    return { ok: false, error: 'extensionVersion is required (max 32 characters)' };
  }

  let channel = typeof query.channel === 'string' ? query.channel.trim() : 'unknown';
  if (!PACKAGE_QUERY_CHANNELS.includes(channel as (typeof PACKAGE_QUERY_CHANNELS)[number])) {
    channel = 'unknown';
  }

  let hostname: string | null = null;
  if (typeof query.hostname === 'string' && query.hostname.trim()) {
    if (!isValidHostnameOnly(query.hostname)) {
      return { ok: false, error: 'hostname must be a valid hostname without path' };
    }
    hostname = query.hostname.trim().toLowerCase();
  }

  return { ok: true, extensionVersion, channel, hostname };
}

function packageR2Key(packageId: string, filename: string): string {
  return `${R2_PREFIX}/${packageId}/${filename}`;
}

export async function readPackageThemeBytes(
  db: any,
  bucket: any,
  packageId: string
): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  const row = await db
    .prepare('SELECT theme_json, bundle_r2_key FROM bsplus_remote_theme_packages WHERE package_id = ?')
    .bind(packageId)
    .first<{ theme_json: string | null; bundle_r2_key: string | null }>();

  if (!row) return null;

  if (row.theme_json && row.theme_json.trim()) {
    const bytes = new TextEncoder().encode(row.theme_json);
    return { bytes, contentType: 'application/json' };
  }

  const key = row.bundle_r2_key || packageR2Key(packageId, 'bundle.json');
  if (!bucket) return null;
  const object = await bucket.get(key);
  if (!object) return null;
  const buffer = await object.arrayBuffer();
  return { bytes: new Uint8Array(buffer), contentType: object.httpMetadata?.contentType ?? 'application/json' };
}

export function parseThemeContentFromBytes(bytes: Uint8Array): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    return typeof parsed === 'object' && parsed && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function buildPublicRemoteThemePackageResponse(
  event: H3Event,
  db: any,
  packageId: string
) {
  const row = await db
    .prepare('SELECT * FROM bsplus_remote_theme_packages WHERE package_id = ? AND enabled = 1')
    .bind(packageId)
    .first<RemoteThemePackageRow>();

  if (!row) return null;

  const apiUrl = getPublicApiUrl(event);
  const downloadUrl = `${apiUrl}/api/bsplus/remote-theme-packages/${encodeURIComponent(packageId)}/bundle.json`;
  const bucket = getBucket(event);
  const bundle = await readPackageThemeBytes(db, bucket, packageId);
  if (!bundle) return null;

  const sha256 = row.sha256 || (await sha256HexBytes(bundle.bytes));
  const themeObj = parseThemeContentFromBytes(bundle.bytes);
  const inlineOk = bundle.bytes.byteLength <= INLINE_THEME_MAX_BYTES;

  const response: Record<string, unknown> = {
    packageId: row.package_id,
    version: String(row.version),
    contentType: 'application/json',
    downloadUrl,
    sha256,
  };

  if (inlineOk && themeObj) {
    response.theme = themeObj;
  }

  return response;
}

export async function listAdminRemoteThemePackages(db: any) {
  const result = await db
    .prepare(
      'SELECT package_id, version, sha256, enabled, created_at, updated_at, theme_json, bundle_r2_key FROM bsplus_remote_theme_packages ORDER BY updated_at DESC'
    )
    .all();
  return ((result.results || []) as Record<string, unknown>[]).map((row) => ({
    packageId: String(row.package_id),
    version: String(row.version),
    enabled: row.enabled === 1 || row.enabled === true,
    sha256: row.sha256 ? String(row.sha256) : null,
    storage: row.theme_json ? 'inline' : row.bundle_r2_key ? 'r2' : 'missing',
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function getAdminRemoteThemePackage(db: any, packageId: string) {
  const row = await db
    .prepare('SELECT * FROM bsplus_remote_theme_packages WHERE package_id = ?')
    .bind(packageId)
    .first<RemoteThemePackageRow>();
  if (!row) return null;
  return {
    packageId: row.package_id,
    version: row.version,
    enabled: row.enabled === 1,
    sha256: row.sha256,
    themeJson: row.theme_json,
    bundleR2Key: row.bundle_r2_key,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function upsertRemoteThemePackage(
  db: any,
  bucket: any,
  packageId: string,
  body: Record<string, unknown>
) {
  if (!isValidRemoteThemePackageId(packageId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid packageId' });
  }

  const existingRow = await db
    .prepare('SELECT * FROM bsplus_remote_theme_packages WHERE package_id = ?')
    .bind(packageId)
    .first<RemoteThemePackageRow>();

  const version =
    typeof body.version === 'string' && body.version.trim()
      ? body.version.trim().slice(0, 32)
      : existingRow
        ? String(existingRow.version)
        : null;
  if (!version) {
    throw createError({ statusCode: 400, statusMessage: 'version is required' });
  }

  let themeJson: string | null = existingRow?.theme_json ?? null;
  let bundleR2Key: string | null = existingRow?.bundle_r2_key ?? null;
  let sha256: string | null = existingRow?.sha256 ?? null;

  if (typeof body.sha256 === 'string' && /^[a-f0-9]{64}$/i.test(body.sha256.trim())) {
    sha256 = body.sha256.trim().toLowerCase();
  }

  if (body.theme !== undefined) {
    const themeObj =
      typeof body.theme === 'object' && body.theme ? (body.theme as Record<string, unknown>) : null;
    if (!themeObj) {
      throw createError({ statusCode: 400, statusMessage: 'theme must be a JSON object' });
    }
    themeJson = JSON.stringify(themeObj);
    sha256 = await sha256HexBytes(new TextEncoder().encode(themeJson));
    bundleR2Key = null;
  } else if (typeof body.themeJson === 'string' && body.themeJson.trim()) {
    themeJson = body.themeJson.trim();
    if (!parseThemeContentFromBytes(new TextEncoder().encode(themeJson))) {
      throw createError({ statusCode: 400, statusMessage: 'themeJson must be valid JSON object' });
    }
    sha256 = await sha256HexBytes(new TextEncoder().encode(themeJson));
    bundleR2Key = null;
  }

  if (themeJson && themeJson.length > INLINE_THEME_MAX_BYTES) {
    if (!bucket) {
      throw createError({ statusCode: 500, statusMessage: 'Storage unavailable for large theme bundle' });
    }
    bundleR2Key = packageR2Key(packageId, 'bundle.json');
    await bucket.put(bundleR2Key, themeJson, {
      httpMetadata: { contentType: 'application/json' },
    });
    themeJson = null;
  }

  if (!existingRow && !themeJson && !bundleR2Key) {
    throw createError({ statusCode: 400, statusMessage: 'theme or themeJson is required for new packages' });
  }

  const enabled = body.enabled !== undefined ? body.enabled !== false : existingRow ? existingRow.enabled === 1 : true;
  const now = nowUnix();

  if (existingRow) {
    await db
      .prepare(
        `UPDATE bsplus_remote_theme_packages SET
           version = ?,
           theme_json = ?,
           bundle_r2_key = ?,
           sha256 = ?,
           enabled = ?,
           updated_at = ?
         WHERE package_id = ?`
      )
      .bind(version, themeJson, bundleR2Key, sha256, enabled ? 1 : 0, now, packageId)
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO bsplus_remote_theme_packages (
           package_id, version, theme_json, bundle_r2_key, sha256, enabled, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(packageId, version, themeJson, bundleR2Key, sha256, enabled ? 1 : 0, now, now)
      .run();
  }

  return getAdminRemoteThemePackage(db, packageId);
}

export async function deleteRemoteThemePackage(db: any, bucket: any, packageId: string) {
  const row = await db
    .prepare('SELECT bundle_r2_key FROM bsplus_remote_theme_packages WHERE package_id = ?')
    .bind(packageId)
    .first<{ bundle_r2_key: string | null }>();
  if (!row) return false;

  await db.prepare('DELETE FROM bsplus_remote_theme_packages WHERE package_id = ?').bind(packageId).run();

  if (bucket && row.bundle_r2_key) {
    try {
      await bucket.delete(row.bundle_r2_key);
    } catch {
      // best-effort
    }
  }
  return true;
}

export { createApiEnvelope, createApiError };
