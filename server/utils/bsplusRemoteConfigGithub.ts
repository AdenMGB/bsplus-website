import type { H3Event } from 'h3';
import type { RemoteConfigSnapshotData } from './bsplusRemoteConfig';
import {
  buildSnapshotCampaigns,
  compactGlobalForExport,
  filterActiveFeatureGates,
  getPublishedSnapshot,
  loadDraftFeatures,
  loadDraftGlobal,
  loadDraftRemoteThemeDirective,
  type RemoteConfigCampaign,
} from './bsplusRemoteConfig';
import { resolveSnapshotRemoteTheme } from './bsplusRemoteThemePackages';

export type GithubBsStatusConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  pathPrefix: string;
};

export type GithubMirrorSyncResult = {
  synced: boolean;
  commit?: string;
  files?: string[];
  skipped_reason?: 'missing_token' | 'nothing_published';
  error?: string;
};

const GITHUB_API = 'https://api.github.com';
const GITHUB_USER_AGENT = 'BetterSEQTA-Website/1.0 (bsplus-remote-config; +https://betterseqta.org)';

function getCloudflareEnv(event?: H3Event | null) {
  return (
    (event as any)?.context?.cloudflare?.env ??
    (event as any)?.req?.runtime?.cloudflare?.env ??
    (globalThis as any).__env__ ??
    null
  );
}

export function getGithubBsStatusConfig(event?: H3Event | null): GithubBsStatusConfig {
  const cfEnv = getCloudflareEnv(event);
  let runtimeToken = '';
  try {
    runtimeToken = String(useRuntimeConfig(event as H3Event).githubBsStatusToken ?? '');
  } catch {
    runtimeToken = '';
  }

  const token = String(
    cfEnv?.GITHUB_BS_STATUS_TOKEN ??
      cfEnv?.NUXT_GITHUB_BS_STATUS_TOKEN ??
      process.env.GITHUB_BS_STATUS_TOKEN ??
      process.env.NUXT_GITHUB_BS_STATUS_TOKEN ??
      runtimeToken ??
      ''
  ).trim();

  return {
    token,
    owner: String(
      cfEnv?.GITHUB_BS_STATUS_OWNER ??
        process.env.GITHUB_BS_STATUS_OWNER ??
        'BetterSEQTA'
    ).trim(),
    repo: String(
      cfEnv?.GITHUB_BS_STATUS_REPO ?? process.env.GITHUB_BS_STATUS_REPO ?? 'BS-Status'
    ).trim(),
    branch: String(
      cfEnv?.GITHUB_BS_STATUS_BRANCH ?? process.env.GITHUB_BS_STATUS_BRANCH ?? 'main'
    ).trim(),
    pathPrefix: String(
      cfEnv?.GITHUB_BS_STATUS_PATH ?? process.env.GITHUB_BS_STATUS_PATH ?? 'config'
    )
      .trim()
      .replace(/^\/+|\/+$/g, ''),
  };
}

function toBase64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

async function githubRequest(
  cfg: GithubBsStatusConfig,
  path: string,
  init: RequestInit
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${GITHUB_API}${path}`;
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${cfg.token}`);
  headers.set('Accept', 'application/vnd.github+json');
  headers.set('X-GitHub-Api-Version', '2022-11-28');
  headers.set('User-Agent', GITHUB_USER_AGENT);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...init, headers });
}

async function getContentSha(
  cfg: GithubBsStatusConfig,
  repoPath: string
): Promise<string | undefined> {
  const q = new URLSearchParams({ ref: cfg.branch });
  const res = await githubRequest(
    cfg,
    `/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${repoPath}?${q}`,
    { method: 'GET' }
  );
  if (res.status === 404) return undefined;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub GET ${repoPath} failed (${res.status}): ${err.slice(0, 200)}`);
  }
  const data = (await res.json()) as { sha?: string };
  return data.sha;
}

async function upsertRepoFile(
  cfg: GithubBsStatusConfig,
  repoPath: string,
  content: string,
  message: string
): Promise<string | undefined> {
  const sha = await getContentSha(cfg, repoPath);
  const body = {
    message,
    content: toBase64Utf8(content),
    branch: cfg.branch,
    ...(sha ? { sha } : {}),
  };
  const res = await githubRequest(
    cfg,
    `/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${repoPath}`,
    { method: 'PUT', body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT ${repoPath} failed (${res.status}): ${err.slice(0, 300)}`);
  }
  const data = (await res.json()) as { commit?: { sha?: string } };
  return data.commit?.sha;
}

export type GithubMirrorSource = 'published-snapshot' | 'draft-tables';

/** BS-Status repo files. On publish, mirrors the D1 snapshot clients receive from the API. */
export async function buildGithubMirrorPayload(
  db: any,
  snapshot: RemoteConfigSnapshotData,
  source: GithubMirrorSource = 'published-snapshot'
): Promise<{
  configVersion: string;
  global: Record<string, unknown>;
  features: Record<string, unknown>;
  campaigns: RemoteConfigCampaign[];
  remoteTheme: RemoteConfigSnapshotData['remoteTheme'];
}> {
  if (source === 'published-snapshot') {
    return {
      configVersion: snapshot.configVersion,
      global: compactGlobalForExport(snapshot.global),
      features: filterActiveFeatureGates(snapshot.features),
      campaigns: snapshot.campaigns,
      remoteTheme: snapshot.remoteTheme ?? null,
    };
  }

  const global = compactGlobalForExport(await loadDraftGlobal(db));
  const features = filterActiveFeatureGates(await loadDraftFeatures(db));
  const campaigns = await buildSnapshotCampaigns(db, { activeOnly: true });
  const remoteTheme = await resolveSnapshotRemoteTheme(db, await loadDraftRemoteThemeDirective(db));

  return {
    configVersion: snapshot.configVersion,
    global,
    features,
    campaigns,
    remoteTheme,
  };
}

/** Force sync: published configVersion + current draft tables. */
export async function buildGithubMirrorPayloadFromDraft(
  db: any
): Promise<{ payload: Awaited<ReturnType<typeof buildGithubMirrorPayload>>; configVersion: string } | null> {
  const published = await getPublishedSnapshot(db);
  const configVersion = published?.configVersion ?? new Date().toISOString();

  const snapshot: RemoteConfigSnapshotData = {
    configVersion,
    etag: published?.etag ?? '',
    source: 'api',
    global: await loadDraftGlobal(db),
    features: {},
    campaigns: [],
    remoteTheme: null,
  };

  const payload = await buildGithubMirrorPayload(db, snapshot);
  return { configVersion, payload };
}

export async function syncRemoteConfigToGithub(
  event: H3Event,
  db: any,
  snapshot: RemoteConfigSnapshotData,
  commitLabel = 'publish'
): Promise<GithubMirrorSyncResult> {
  const cfg = getGithubBsStatusConfig(event);
  if (!cfg.token) {
    return { synced: false, skipped_reason: 'missing_token' };
  }

  try {
    const mirrorSource: GithubMirrorSource =
      commitLabel === 'force-sync' ? 'draft-tables' : 'published-snapshot';
    const mirror = await buildGithubMirrorPayload(db, snapshot, mirrorSource);
    const prefix = cfg.pathPrefix;
    const manifest = {
      configVersion: mirror.configVersion,
      updatedAt: new Date().toISOString(),
      files: {
        global: 'global.json',
        features: 'features.json',
        campaigns: 'campaigns.json',
        remoteTheme: 'remoteTheme.json',
      },
    };

    const files: Array<{ path: string; json: unknown }> = [
      { path: `${prefix}/manifest.json`, json: manifest },
      { path: `${prefix}/global.json`, json: mirror.global },
      { path: `${prefix}/features.json`, json: mirror.features },
      { path: `${prefix}/campaigns.json`, json: mirror.campaigns },
      { path: `${prefix}/remoteTheme.json`, json: mirror.remoteTheme },
    ];

    let lastSha: string | undefined;
    const written: string[] = [];
    for (const file of files) {
      const text = `${JSON.stringify(file.json, null, 2)}\n`;
      lastSha = await upsertRepoFile(
        cfg,
        file.path,
        text,
        `chore(bs-status): remote config ${commitLabel} ${mirror.configVersion} (${file.path})`
      );
      written.push(file.path);
    }

    return { synced: true, commit: lastSha, files: written };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[bsplus/github-mirror]', message);
    return { synced: false, error: message };
  }
}

export async function forceSyncRemoteConfigToGithub(
  event: H3Event,
  db: any
): Promise<GithubMirrorSyncResult> {
  const cfg = getGithubBsStatusConfig(event);
  if (!cfg.token) {
    return { synced: false, skipped_reason: 'missing_token' };
  }

  const built = await buildGithubMirrorPayloadFromDraft(db);
  if (!built) {
    return { synced: false, skipped_reason: 'nothing_published' };
  }

  const snapshot: RemoteConfigSnapshotData = {
    configVersion: built.configVersion,
    etag: '',
    source: 'api',
    global: await loadDraftGlobal(db),
    features: {},
    campaigns: [],
    remoteTheme: null,
  };

  return syncRemoteConfigToGithub(event, db, snapshot, 'force-sync');
}
