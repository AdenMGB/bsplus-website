import type { H3Event } from 'h3';
import { createApiError, createApiEnvelope } from './customThemes';
import { getBucket } from './r2';
import { getPublicApiUrl } from './publicApi';

export const REMOTE_THEME_PACKAGE_ID_RE = /^[a-z0-9][a-z0-9-]{2,62}$/;
export const REMOTE_THEME_MODES = ['off', 'optional', 'forced'] as const;
export type RemoteThemeMode = (typeof REMOTE_THEME_MODES)[number];

export const REMOTE_THEME_APPLICATION_MODES = ['replace', 'overlay'] as const;
export type RemoteThemeApplicationMode = (typeof REMOTE_THEME_APPLICATION_MODES)[number];

export const OVERLAY_LAYER_ID_RE = /^[a-z0-9][a-z0-9-_]{0,62}$/i;
export const MAX_OVERLAY_LAYERS = 5;

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
  applicationMode?: RemoteThemeApplicationMode;
};

export type RemoteThemePackageRow = {
  package_id: string;
  version: string;
  theme_json: string | null;
  bundle_r2_key: string | null;
  sha256: string | null;
  enabled: number;
  application_mode?: string | null;
  overlay_layers_json?: string | null;
  overlay_hints_json?: string | null;
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

  if (typeof obj.applicationMode === 'string') {
    const am = obj.applicationMode.trim() as RemoteThemeApplicationMode;
    if (!REMOTE_THEME_APPLICATION_MODES.includes(am)) {
      return null;
    }
    if (am !== 'replace') {
      directive.applicationMode = am;
    }
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
      `SELECT package_id, version, enabled, application_mode
       FROM bsplus_remote_theme_packages WHERE package_id = ?`
    )
    .bind(directive.packageId)
    .first<{ package_id: string; version: string; enabled: number; application_mode: string | null }>();

  if (!pkg || !pkg.enabled) return null;

  const directiveAppMode = directive.applicationMode ?? 'replace';
  const packageAppMode = parseApplicationModeInput(pkg.application_mode);
  if (directiveAppMode !== packageAppMode) {
    console.warn(
      `[bsplus/remote-theme] applicationMode mismatch for ${directive.packageId}: snapshot=${directiveAppMode} package=${packageAppMode} (snapshot wins)`
    );
  }

  const out: RemoteThemeDirective = {
    packageId: directive.packageId,
    packageVersion: directive.packageVersion ?? String(pkg.version),
    mode: directive.mode,
  };
  if (directive.activeFrom) out.activeFrom = directive.activeFrom;
  if (directive.activeTo) out.activeTo = directive.activeTo;
  if (directive.message) out.message = directive.message;
  if (directive.allowUserOptOut === true) out.allowUserOptOut = true;
  if (directiveAppMode !== 'replace') out.applicationMode = directiveAppMode;
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
    .prepare('SELECT * FROM bsplus_remote_theme_packages WHERE package_id = ?')
    .bind(packageId)
    .first<RemoteThemePackageRow>();

  if (!row) return null;

  const layers = parseOverlayLayersFromRow(row);
  const applicationMode = parseApplicationModeInput(row.application_mode);
  let overlayHints: Record<string, unknown> | null = null;
  if (row.overlay_hints_json?.trim()) {
    try {
      overlayHints = parseOverlayHintsInput(JSON.parse(row.overlay_hints_json));
    } catch {
      overlayHints = null;
    }
  }

  if (layers?.length) {
    const payload = buildPackageDownloadPayload(row, layers, null, applicationMode, overlayHints);
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    return { bytes, contentType: 'application/json' };
  }

  if (row.theme_json && row.theme_json.trim()) {
    const themeObj = parseThemeContentFromBytes(new TextEncoder().encode(row.theme_json));
    if (themeObj) {
      const payload = buildPackageDownloadPayload(row, null, themeObj, applicationMode, overlayHints);
      const bytes = new TextEncoder().encode(JSON.stringify(payload));
      return { bytes, contentType: 'application/json' };
    }
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

export function parseApplicationModeInput(
  value: unknown,
  defaultValue: RemoteThemeApplicationMode = 'replace'
): RemoteThemeApplicationMode {
  if (typeof value !== 'string') return defaultValue;
  const v = value.trim() as RemoteThemeApplicationMode;
  return REMOTE_THEME_APPLICATION_MODES.includes(v) ? v : defaultValue;
}

export function parseOverlayHintsInput(value: unknown): Record<string, unknown> | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw createError({ statusCode: 422, statusMessage: 'overlayHints must be an object' });
  }
  return value as Record<string, unknown>;
}

export function parseOverlayLayersInput(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    throw createError({ statusCode: 422, statusMessage: 'overlayLayers must be an array' });
  }
  if (value.length < 1 || value.length > MAX_OVERLAY_LAYERS) {
    throw createError({
      statusCode: 422,
      statusMessage: `overlayLayers must contain between 1 and ${MAX_OVERLAY_LAYERS} layers`,
    });
  }

  const layers: Record<string, unknown>[] = [];
  const seenIds = new Set<string>();

  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw createError({ statusCode: 422, statusMessage: 'Each overlay layer must be an object' });
    }
    const layer = item as Record<string, unknown>;
    const id = typeof layer.id === 'string' ? layer.id.trim() : '';
    if (!OVERLAY_LAYER_ID_RE.test(id)) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Each overlay layer requires id (lowercase slug, max 64 characters)',
      });
    }
    const idKey = id.toLowerCase();
    if (seenIds.has(idKey)) {
      throw createError({ statusCode: 422, statusMessage: `Duplicate overlay layer id: ${id}` });
    }
    seenIds.add(idKey);

    if (typeof layer.CustomCSS !== 'string' || !layer.CustomCSS.trim()) {
      throw createError({ statusCode: 422, statusMessage: `Layer "${id}" requires non-empty CustomCSS` });
    }

    const out: Record<string, unknown> = { id, CustomCSS: layer.CustomCSS };
    if (typeof layer.name === 'string' && layer.name.trim()) out.name = layer.name.trim();
    if (typeof layer.description === 'string') out.description = layer.description;
    for (const key of ['CustomImages', 'themeScript', 'themeDom', 'defaultColour'] as const) {
      if (layer[key] !== undefined) out[key] = layer[key];
    }
    layers.push(out);
  }

  return layers;
}

function parseOverlayLayersFromRow(row: RemoteThemePackageRow): Record<string, unknown>[] | null {
  if (!row.overlay_layers_json?.trim()) return null;
  try {
    return parseOverlayLayersInput(JSON.parse(row.overlay_layers_json));
  } catch {
    return null;
  }
}

function buildPackageDownloadPayload(
  row: RemoteThemePackageRow,
  layers: Record<string, unknown>[] | null,
  themeObj: Record<string, unknown> | null,
  applicationMode: RemoteThemeApplicationMode,
  overlayHints: Record<string, unknown> | null
): Record<string, unknown> {
  const payload: Record<string, unknown> = { packageId: row.package_id, version: row.version };
  if (layers?.length) {
    payload.overlayLayers = layers;
  } else if (themeObj) {
    payload.theme = themeObj;
  }
  if (applicationMode !== 'replace') payload.applicationMode = applicationMode;
  if (overlayHints) payload.overlayHints = overlayHints;
  return payload;
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
  const parsedBundle = parseThemeContentFromBytes(bundle.bytes);
  const inlineOk = bundle.bytes.byteLength <= INLINE_THEME_MAX_BYTES;

  const applicationMode = parseApplicationModeInput(row.application_mode);
  const layers = parseOverlayLayersFromRow(row);

  const response: Record<string, unknown> = {
    packageId: row.package_id,
    version: String(row.version),
    contentType: 'application/json',
    downloadUrl,
    sha256,
  };

  if (applicationMode !== 'replace') {
    response.applicationMode = applicationMode;
  }

  if (layers?.length) {
    if (inlineOk) {
      response.overlayLayers = layers;
    }
  } else {
    const themeObj =
      parsedBundle?.theme && typeof parsedBundle.theme === 'object'
        ? (parsedBundle.theme as Record<string, unknown>)
        : parsedBundle && parsedBundle.CustomCSS
          ? parsedBundle
          : row.theme_json
            ? parseThemeContentFromBytes(new TextEncoder().encode(row.theme_json))
            : null;
    if (inlineOk && themeObj) {
      response.theme = themeObj;
    }
  }

  return response;
}

export async function listAdminRemoteThemePackages(db: any) {
  const result = await db
    .prepare(
      'SELECT package_id, version, sha256, enabled, application_mode, overlay_layers_json, created_at, updated_at, theme_json, bundle_r2_key FROM bsplus_remote_theme_packages ORDER BY updated_at DESC'
    )
    .all();
  return ((result.results || []) as Record<string, unknown>[]).map((row) => {
    const hasLayers = Boolean(row.overlay_layers_json);
    return {
      packageId: String(row.package_id),
      version: String(row.version),
      enabled: row.enabled === 1 || row.enabled === true,
      sha256: row.sha256 ? String(row.sha256) : null,
      applicationMode: parseApplicationModeInput(row.application_mode as string),
      contentKind: hasLayers ? 'overlayLayers' : 'theme',
      storage: row.theme_json ? 'inline' : row.bundle_r2_key ? 'r2' : hasLayers ? 'layers-inline' : 'missing',
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });
}

export async function getAdminRemoteThemePackage(db: any, packageId: string) {
  const row = await db
    .prepare('SELECT * FROM bsplus_remote_theme_packages WHERE package_id = ?')
    .bind(packageId)
    .first<RemoteThemePackageRow>();
  if (!row) return null;
  let overlayLayers: Record<string, unknown>[] | null = null;
  if (row.overlay_layers_json?.trim()) {
    try {
      overlayLayers = JSON.parse(row.overlay_layers_json) as Record<string, unknown>[];
    } catch {
      overlayLayers = null;
    }
  }
  let overlayHints: Record<string, unknown> | null = null;
  if (row.overlay_hints_json?.trim()) {
    try {
      overlayHints = JSON.parse(row.overlay_hints_json) as Record<string, unknown>;
    } catch {
      overlayHints = null;
    }
  }
  return {
    packageId: row.package_id,
    version: row.version,
    enabled: row.enabled === 1,
    sha256: row.sha256,
    applicationMode: parseApplicationModeInput(row.application_mode),
    themeJson: row.theme_json,
    overlayLayers,
    overlayHints,
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

  const applicationMode = parseApplicationModeInput(
    body.applicationMode ?? body.application_mode,
    existingRow ? parseApplicationModeInput(existingRow.application_mode) : 'replace'
  );

  const hasThemeInput =
    body.theme !== undefined ||
    (typeof body.themeJson === 'string' && body.themeJson.trim().length > 0);
  const hasLayersInput = body.overlayLayers !== undefined;

  if (hasThemeInput && hasLayersInput) {
    throw createError({
      statusCode: 422,
      statusMessage: 'theme and overlayLayers are mutually exclusive',
    });
  }

  let themeJson: string | null = existingRow?.theme_json ?? null;
  let overlayLayersJson: string | null = existingRow?.overlay_layers_json ?? null;
  let overlayHintsJson: string | null = existingRow?.overlay_hints_json ?? null;
  let bundleR2Key: string | null = existingRow?.bundle_r2_key ?? null;
  let sha256: string | null = existingRow?.sha256 ?? null;

  if (typeof body.sha256 === 'string' && /^[a-f0-9]{64}$/i.test(body.sha256.trim())) {
    sha256 = body.sha256.trim().toLowerCase();
  }

  if (body.overlayHints !== undefined) {
    const hints = parseOverlayHintsInput(body.overlayHints);
    overlayHintsJson = hints ? JSON.stringify(hints) : null;
  }

  if (hasLayersInput) {
    const layers = parseOverlayLayersInput(body.overlayLayers);
    overlayLayersJson = JSON.stringify(layers);
    themeJson = null;
    const payload = buildPackageDownloadPayload(
      { ...existingRow, package_id: packageId, version } as RemoteThemePackageRow,
      layers,
      null,
      applicationMode,
      overlayHintsJson ? JSON.parse(overlayHintsJson) : null
    );
    const serialized = JSON.stringify(payload);
    sha256 = await sha256HexBytes(new TextEncoder().encode(serialized));
    bundleR2Key = null;
    if (serialized.length > INLINE_THEME_MAX_BYTES) {
      if (!bucket) {
        throw createError({ statusCode: 500, statusMessage: 'Storage unavailable for large overlay bundle' });
      }
      bundleR2Key = packageR2Key(packageId, 'bundle.json');
      await bucket.put(bundleR2Key, serialized, {
        httpMetadata: { contentType: 'application/json' },
      });
    }
  } else if (hasThemeInput) {
    overlayLayersJson = null;
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

  if (!existingRow && !themeJson && !bundleR2Key && !overlayLayersJson) {
    throw createError({
      statusCode: 400,
      statusMessage: 'theme, themeJson, or overlayLayers is required for new packages',
    });
  }

  const enabled = body.enabled !== undefined ? body.enabled !== false : existingRow ? existingRow.enabled === 1 : true;
  const now = nowUnix();

  if (existingRow) {
    await db
      .prepare(
        `UPDATE bsplus_remote_theme_packages SET
           version = ?,
           theme_json = ?,
           overlay_layers_json = ?,
           overlay_hints_json = ?,
           application_mode = ?,
           bundle_r2_key = ?,
           sha256 = ?,
           enabled = ?,
           updated_at = ?
         WHERE package_id = ?`
      )
      .bind(
        version,
        themeJson,
        overlayLayersJson,
        overlayHintsJson,
        applicationMode,
        bundleR2Key,
        sha256,
        enabled ? 1 : 0,
        now,
        packageId
      )
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO bsplus_remote_theme_packages (
           package_id, version, theme_json, overlay_layers_json, overlay_hints_json,
           application_mode, bundle_r2_key, sha256, enabled, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        packageId,
        version,
        themeJson,
        overlayLayersJson,
        overlayHintsJson,
        applicationMode,
        bundleR2Key,
        sha256,
        enabled ? 1 : 0,
        now,
        now
      )
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
