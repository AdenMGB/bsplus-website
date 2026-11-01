import type {
  RemoteConfigCampaign,
  RemoteConfigFeature,
  RemoteConfigGlobal,
  RemoteConfigSnapshotData,
} from './bsplusRemoteConfig';
import {
  campaignRowToPublic,
  isCampaignActiveNow,
} from './bsplusRemoteConfig';
import {
  parseRemoteThemeDirectiveInput,
  type RemoteThemeDirective,
} from './bsplusRemoteThemePackages';
import { generateUUID } from './themes';

export type RemoteConfigClientContext = {
  installId: string;
  extensionVersion: string;
  channel: string;
  hostname: string | null;
  userId: string | null;
};

export type RemoteConfigAudienceRule = {
  channels?: string[];
  minExtensionVersion?: string;
  maxExtensionVersion?: string;
  hostnameSuffixes?: string[];
  installIds?: string[];
  userIds?: string[];
  denyInstallIds?: string[];
  denyUserIds?: string[];
  /** Stable percentage rollout by installId (0–100). */
  percentage?: number;
};

export type RemoteConfigOverrideRow = {
  id: string;
  scope: 'install' | 'user';
  scope_id: string;
  kind:
    | 'feature'
    | 'feature_allow'
    | 'campaign_force_include'
    | 'campaign_force_exclude'
    | 'global'
    | 'remote_theme';
  target_key: string | null;
  value_json: string;
  enabled: number;
  note: string | null;
  created_at: number;
  updated_at: number;
};

const OVERRIDE_KINDS = new Set([
  'feature',
  'feature_allow',
  'campaign_force_include',
  'campaign_force_exclude',
  'global',
  'remote_theme',
]);

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

function normalizeUuidList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const out = value
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map((v) => v.trim().toLowerCase());
  return out.length ? out : undefined;
}

export function parseAudienceRule(value: unknown): RemoteConfigAudienceRule | null {
  const obj = parseJsonObject(value);
  if (!obj) return null;

  const rule: RemoteConfigAudienceRule = {};

  if (Array.isArray(obj.channels)) {
    const channels = obj.channels
      .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
      .map((c) => c.trim());
    if (channels.length) rule.channels = channels;
  }

  if (typeof obj.minExtensionVersion === 'string' && obj.minExtensionVersion.trim()) {
    rule.minExtensionVersion = obj.minExtensionVersion.trim().slice(0, 32);
  }
  if (typeof obj.maxExtensionVersion === 'string' && obj.maxExtensionVersion.trim()) {
    rule.maxExtensionVersion = obj.maxExtensionVersion.trim().slice(0, 32);
  }

  if (Array.isArray(obj.hostnameSuffixes)) {
    const suffixes = obj.hostnameSuffixes
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .map((s) => s.trim().toLowerCase());
    if (suffixes.length) rule.hostnameSuffixes = suffixes;
  }

  rule.installIds = normalizeUuidList(obj.installIds);
  rule.userIds = normalizeUuidList(obj.userIds);
  rule.denyInstallIds = normalizeUuidList(obj.denyInstallIds);
  rule.denyUserIds = normalizeUuidList(obj.denyUserIds);

  if (typeof obj.percentage === 'number' && Number.isFinite(obj.percentage)) {
    rule.percentage = Math.min(100, Math.max(0, Math.round(obj.percentage)));
  }

  return Object.keys(rule).length ? rule : null;
}

export function serializeAudienceRule(rule: RemoteConfigAudienceRule | null): string | null {
  if (!rule || !Object.keys(rule).length) return null;
  return JSON.stringify(rule);
}

export function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map((p) => parseInt(p.replace(/[^0-9].*$/, ''), 10) || 0);
  const pb = b.split('.').map((p) => parseInt(p.replace(/[^0-9].*$/, ''), 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da < db) return -1;
    if (da > db) return 1;
  }
  return 0;
}

function extensionVersionInRange(
  version: string,
  minVersion?: string | null,
  maxVersion?: string | null
): boolean {
  if (minVersion && compareSemver(version, minVersion) < 0) return false;
  if (maxVersion && compareSemver(version, maxVersion) > 0) return false;
  return true;
}

async function stableInstallBucket0to99(installId: string): Promise<number> {
  const data = new TextEncoder().encode(installId.toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  const n = (bytes[0]! << 16) | (bytes[1]! << 8) | bytes[2]!;
  return n % 100;
}

export async function matchesAudienceRule(
  rule: RemoteConfigAudienceRule | null | undefined,
  context: RemoteConfigClientContext
): Promise<boolean> {
  if (!rule) return true;

  if (rule.denyInstallIds?.includes(context.installId.toLowerCase())) return false;
  if (context.userId && rule.denyUserIds?.includes(context.userId.toLowerCase())) return false;

  if (rule.installIds?.length && !rule.installIds.includes(context.installId.toLowerCase())) {
    return false;
  }
  if (rule.userIds?.length) {
    if (!context.userId || !rule.userIds.includes(context.userId.toLowerCase())) {
      return false;
    }
  }

  if (rule.channels?.length && !rule.channels.includes(context.channel)) {
    return false;
  }

  if (
    !extensionVersionInRange(
      context.extensionVersion,
      rule.minExtensionVersion,
      rule.maxExtensionVersion
    )
  ) {
    return false;
  }

  if (rule.hostnameSuffixes?.length) {
    const host = context.hostname?.toLowerCase() ?? '';
    if (!host) return false;
    const matched = rule.hostnameSuffixes.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`) || host.endsWith(suffix)
    );
    if (!matched) return false;
  }

  if (rule.percentage !== undefined) {
    const bucket = await stableInstallBucket0to99(context.installId);
    if (bucket >= rule.percentage) return false;
  }

  return true;
}

async function campaignMatchesClient(
  campaign: RemoteConfigCampaign,
  targetingJson: string | null | undefined,
  context: RemoteConfigClientContext
): Promise<boolean> {
  if (!extensionVersionInRange(context.extensionVersion, campaign.minVersion, campaign.maxVersion)) {
    return false;
  }
  const rule = parseAudienceRule(targetingJson);
  return matchesAudienceRule(rule, context);
}

async function loadCampaignTargetingMap(
  db: any,
  campaignIds: string[]
): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  if (!campaignIds.length) return map;
  const placeholders = campaignIds.map(() => '?').join(', ');
  const result = await db
    .prepare(
      `SELECT id, targeting_json FROM bsplus_remote_config_campaigns WHERE id IN (${placeholders})`
    )
    .bind(...campaignIds)
    .all();
  for (const row of (result.results || []) as { id: string; targeting_json?: string | null }[]) {
    map.set(row.id, row.targeting_json ?? null);
  }
  return map;
}

async function loadFeatureTargetingMap(
  db: any,
  featureKeys: string[]
): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  if (!featureKeys.length) return map;
  const placeholders = featureKeys.map(() => '?').join(', ');
  const result = await db
    .prepare(
      `SELECT feature_key, targeting_json FROM bsplus_remote_config_features WHERE feature_key IN (${placeholders})`
    )
    .bind(...featureKeys)
    .all();
  for (const row of (result.results || []) as {
    feature_key: string;
    targeting_json?: string | null;
  }[]) {
    map.set(row.feature_key, row.targeting_json ?? null);
  }
  return map;
}

async function loadRemoteThemeTargeting(db: any): Promise<string | null> {
  const row = await db
    .prepare('SELECT remote_theme_targeting_json FROM bsplus_remote_config_global WHERE id = 1')
    .first<{ remote_theme_targeting_json?: string | null }>();
  return row?.remote_theme_targeting_json ?? null;
}

export async function loadActiveOverrides(
  db: any,
  installId: string,
  userId: string | null
): Promise<RemoteConfigOverrideRow[]> {
  const scopes: Array<{ scope: 'install' | 'user'; scope_id: string }> = [
    { scope: 'install', scope_id: installId },
  ];
  if (userId) {
    scopes.push({ scope: 'user', scope_id: userId });
  }

  const rows: RemoteConfigOverrideRow[] = [];
  for (const { scope, scope_id } of scopes) {
    const result = await db
      .prepare(
        `SELECT * FROM bsplus_remote_config_overrides
         WHERE scope = ? AND scope_id = ? AND enabled = 1
         ORDER BY updated_at ASC`
      )
      .bind(scope, scope_id)
      .all();
    rows.push(...((result.results || []) as RemoteConfigOverrideRow[]));
  }
  return rows;
}

export async function getPersonalizationRevision(
  db: any,
  installId: string,
  userId: string | null
): Promise<number> {
  const [campaigns, features, globalRow, overrides] = await Promise.all([
    db.prepare('SELECT MAX(updated_at) AS rev FROM bsplus_remote_config_campaigns').first<{ rev?: number }>(),
    db.prepare('SELECT MAX(updated_at) AS rev FROM bsplus_remote_config_features').first<{ rev?: number }>(),
    db.prepare('SELECT MAX(updated_at) AS rev FROM bsplus_remote_config_global').first<{ rev?: number }>(),
    db
      .prepare(
        `SELECT MAX(updated_at) AS rev FROM bsplus_remote_config_overrides
         WHERE enabled = 1 AND (
           (scope = 'install' AND scope_id = ?)
           OR (scope = 'user' AND scope_id = ?)
         )`
      )
      .bind(installId, userId ?? '')
      .first<{ rev?: number }>(),
  ]);

  return Math.max(
    campaigns?.rev ?? 0,
    features?.rev ?? 0,
    globalRow?.rev ?? 0,
    overrides?.rev ?? 0,
    0
  );
}

export async function computePersonalizedEtag(
  baseEtag: string,
  context: RemoteConfigClientContext,
  revision: number
): Promise<string> {
  const payload = JSON.stringify({
    base: baseEtag,
    installId: context.installId,
    userId: context.userId,
    extensionVersion: context.extensionVersion,
    channel: context.channel,
    hostname: context.hostname,
    revision,
  });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `W/"p-${hex.slice(0, 24)}"`;
}

async function loadCampaignById(db: any, id: string): Promise<RemoteConfigCampaign | null> {
  const row = await db
    .prepare('SELECT * FROM bsplus_remote_config_campaigns WHERE id = ? AND enabled = 1')
    .bind(id)
    .first<Record<string, unknown>>();
  if (!row) return null;
  const campaign = campaignRowToPublic(row, { includeBody: true });
  if (!campaign || !isCampaignActiveNow(campaign)) return null;
  return campaign;
}

function applyGlobalPatch(global: RemoteConfigGlobal, patch: Record<string, unknown>): RemoteConfigGlobal {
  const next = { ...global };
  if (patch.mode === 'on' || patch.mode === 'off') next.mode = patch.mode;
  if (typeof patch.allowLocalOverride === 'boolean') next.allowLocalOverride = patch.allowLocalOverride;
  if (typeof patch.statusMessage === 'string' || patch.statusMessage === null) {
    next.statusMessage = patch.statusMessage as string | null;
  }
  if (typeof patch.disableCloudSync === 'boolean') next.disableCloudSync = patch.disableCloudSync;
  if (typeof patch.disableThemeStore === 'boolean') next.disableThemeStore = patch.disableThemeStore;
  if (typeof patch.disableFeedbackSubmit === 'boolean') {
    next.disableFeedbackSubmit = patch.disableFeedbackSubmit;
  }
  if (typeof patch.minExtensionVersion === 'string' || patch.minExtensionVersion === null) {
    next.minExtensionVersion = patch.minExtensionVersion as string | null;
  }
  if (typeof patch.forceUpdateUrl === 'string' || patch.forceUpdateUrl === null) {
    next.forceUpdateUrl = patch.forceUpdateUrl as string | null;
  }
  return next;
}

async function applyClientOverrides(
  db: any,
  state: {
    campaigns: RemoteConfigCampaign[];
    features: Record<string, RemoteConfigFeature>;
    global: RemoteConfigGlobal;
    remoteTheme: RemoteThemeDirective | null;
  },
  overrides: RemoteConfigOverrideRow[]
): Promise<void> {
  let campaigns = [...state.campaigns];
  let features = { ...state.features };
  let global = state.global;
  let remoteTheme = state.remoteTheme;

  for (const row of overrides) {
    const value = parseJsonObject(row.value_json) ?? {};

    switch (row.kind) {
      case 'campaign_force_exclude': {
        const id = row.target_key ?? (typeof value.campaignId === 'string' ? value.campaignId : '');
        if (id) campaigns = campaigns.filter((c) => c.id !== id);
        break;
      }
      case 'campaign_force_include': {
        const id = row.target_key ?? (typeof value.campaignId === 'string' ? value.campaignId : '');
        if (!id) break;
        if (campaigns.some((c) => c.id === id)) break;
        const loaded = await loadCampaignById(db, id);
        if (loaded) campaigns.push(loaded);
        break;
      }
      case 'feature': {
        const key = row.target_key ?? (typeof value.featureKey === 'string' ? value.featureKey : '');
        if (!key || typeof value.mode !== 'string') break;
        const feature: RemoteConfigFeature = { mode: value.mode as RemoteConfigFeature['mode'] };
        if (value.message && typeof value.message === 'object') {
          const m = value.message as Record<string, unknown>;
          if (typeof m.body === 'string') {
            feature.message = {
              body: m.body,
              title: typeof m.title === 'string' ? m.title : undefined,
              severity:
                m.severity === 'warning' || m.severity === 'error' || m.severity === 'info'
                  ? m.severity
                  : undefined,
            };
          }
        }
        features[key] = feature;
        break;
      }
      case 'feature_allow': {
        const key = row.target_key ?? (typeof value.featureKey === 'string' ? value.featureKey : '');
        if (key) delete features[key];
        break;
      }
      case 'global':
        global = applyGlobalPatch(global, value);
        break;
      case 'remote_theme':
        if (value === null || row.value_json === 'null') {
          remoteTheme = null;
        } else {
          const directive = parseRemoteThemeDirectiveInput(value);
          if (directive) remoteTheme = directive;
        }
        break;
      default:
        break;
    }
  }

  campaigns.sort((a, b) => b.priority - a.priority);
  state.campaigns = campaigns;
  state.features = features;
  state.global = global;
  state.remoteTheme = remoteTheme;
}

export async function personalizeRemoteConfigForClient(
  db: any,
  base: RemoteConfigSnapshotData,
  context: RemoteConfigClientContext
): Promise<RemoteConfigSnapshotData> {
  const campaignIds = base.campaigns.map((c) => c.id);
  const campaignTargeting = await loadCampaignTargetingMap(db, campaignIds);
  const featureKeys = Object.keys(base.features);
  const featureTargeting = await loadFeatureTargetingMap(db, featureKeys);
  const remoteThemeTargetingRaw = await loadRemoteThemeTargeting(db);

  const campaigns: RemoteConfigCampaign[] = [];
  for (const campaign of base.campaigns) {
    if (await campaignMatchesClient(campaign, campaignTargeting.get(campaign.id), context)) {
      campaigns.push(campaign);
    }
  }

  const features: Record<string, RemoteConfigFeature> = {};
  for (const [key, gate] of Object.entries(base.features)) {
    const rule = parseAudienceRule(featureTargeting.get(key));
    if (await matchesAudienceRule(rule, context)) {
      features[key] = gate;
    }
  }

  let remoteTheme = base.remoteTheme;
  if (remoteTheme) {
    const rule = parseAudienceRule(remoteThemeTargetingRaw);
    if (!(await matchesAudienceRule(rule, context))) {
      remoteTheme = null;
    }
  }

  const state = {
    campaigns,
    features,
    global: { ...base.global },
    remoteTheme,
  };

  const overrides = await loadActiveOverrides(db, context.installId, context.userId);
  await applyClientOverrides(db, state, overrides);

  return {
    ...base,
    campaigns: state.campaigns,
    features: state.features,
    global: state.global,
    remoteTheme: state.remoteTheme,
  };
}

export function isValidOverrideKind(kind: string): boolean {
  return OVERRIDE_KINDS.has(kind);
}

export function newOverrideId(): string {
  return generateUUID();
}
