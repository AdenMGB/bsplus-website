import type { H3Event } from 'h3';
import {
  searchAccountsInstallLinksInterop,
  searchAccountsUsersInterop,
  searchLocalBsplusInstalls,
} from './accountsInterop';
import { listOverrides, listOverridesForClient } from './bsplusRemoteConfigOverrides';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ClientControlInstall = {
  installId: string;
  userId: string | null;
  deviceName: string | null;
  extensionVersion: string | null;
  channel: string | null;
  browser: string | null;
  hostname: string | null;
  lastSeenAt: number | null;
  linkedCloud: boolean;
  registeredOnWebsite: boolean;
};

export type ClientControlProfile = {
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
  } | null;
  focus: { type: 'user' | 'install'; id: string };
  installs: ClientControlInstall[];
  overrides: ReturnType<typeof listOverridesForClient> extends Promise<infer T> ? T : never;
};

function parseExtensionFromCloud(raw: unknown): {
  version: string | null;
  channel: string | null;
  browser: string | null;
} {
  if (!raw || typeof raw !== 'object') {
    return { version: null, channel: null, browser: null };
  }
  const ext = raw as Record<string, unknown>;
  return {
    version: typeof ext.version === 'string' ? ext.version : null,
    channel: typeof ext.channel === 'string' ? ext.channel : null,
    browser: typeof ext.browser === 'string' ? ext.browser : null,
  };
}

async function resolveUser(
  event: H3Event,
  userId: string,
): Promise<ClientControlProfile['user']> {
  const data = await searchAccountsUsersInterop(event, { q: userId, page: 1, pageSize: 20 });
  const exact = data.users.find((u) => u.id.toLowerCase() === userId.toLowerCase());
  if (exact) return exact;
  if (data.users.length === 1) return data.users[0]!;
  return null;
}

function mergeInstallMaps(
  cloud: Awaited<ReturnType<typeof searchAccountsInstallLinksInterop>>['installs'],
  local: Awaited<ReturnType<typeof searchLocalBsplusInstalls>>['installs'],
): ClientControlInstall[] {
  const byId = new Map<string, ClientControlInstall>();

  for (const row of cloud) {
    const installId = String(row.installId ?? row.install_id ?? '').toLowerCase();
    if (!installId) continue;
    const ext = parseExtensionFromCloud(row.extension);
    const cloudUserId =
      typeof row.cloudUserId === 'string'
        ? row.cloudUserId
        : typeof (row as { cloud_user_id?: string }).cloud_user_id === 'string'
          ? (row as { cloud_user_id: string }).cloud_user_id
          : null;
    byId.set(installId, {
      installId,
      userId: cloudUserId,
      deviceName: typeof row.deviceName === 'string' ? row.deviceName : null,
      extensionVersion: ext.version,
      channel: ext.channel,
      browser: ext.browser,
      hostname: null,
      lastSeenAt: typeof row.lastSeenAt === 'number' ? row.lastSeenAt : null,
      linkedCloud: true,
      registeredOnWebsite: false,
    });
  }

  for (const row of local) {
    const installId = row.installId.toLowerCase();
    const existing = byId.get(installId);
    if (existing) {
      existing.registeredOnWebsite = true;
      existing.userId = existing.userId ?? row.userId;
      existing.extensionVersion = existing.extensionVersion ?? row.extensionVersion;
      existing.channel = existing.channel ?? row.channel;
      existing.browser = existing.browser ?? row.browser;
      existing.hostname = row.hostname;
      if (row.lastSeenAt && (!existing.lastSeenAt || row.lastSeenAt > existing.lastSeenAt)) {
        existing.lastSeenAt = row.lastSeenAt;
      }
    } else {
      byId.set(installId, {
        installId,
        userId: row.userId,
        deviceName: null,
        extensionVersion: row.extensionVersion,
        channel: row.channel,
        browser: row.browser,
        hostname: row.hostname,
        lastSeenAt: row.lastSeenAt,
        linkedCloud: false,
        registeredOnWebsite: true,
      });
    }
  }

  return [...byId.values()].sort((a, b) => (b.lastSeenAt ?? 0) - (a.lastSeenAt ?? 0));
}

export async function buildClientControlProfile(
  event: H3Event,
  db: Parameters<typeof searchLocalBsplusInstalls>[0],
  input: { userId?: string | null; installId?: string | null },
): Promise<ClientControlProfile> {
  let userId = input.userId?.trim().toLowerCase() ?? '';
  let focusInstallId = input.installId?.trim().toLowerCase() ?? '';

  if (!userId && !focusInstallId) {
    throw createError({ statusCode: 422, statusMessage: 'userId or installId is required' });
  }

  if (focusInstallId && !UUID_RE.test(focusInstallId)) {
    throw createError({ statusCode: 422, statusMessage: 'installId must be a UUID' });
  }
  if (userId && !UUID_RE.test(userId)) {
    throw createError({ statusCode: 422, statusMessage: 'userId must be a UUID' });
  }

  if (!userId && focusInstallId) {
    const [cloudHit, localHit] = await Promise.all([
      searchAccountsInstallLinksInterop(event, { q: focusInstallId, page: 1, pageSize: 5 }),
      searchLocalBsplusInstalls(db, { q: focusInstallId, page: 1, pageSize: 5 }),
    ]);
    const cloudRow = cloudHit.installs.find(
      (r) => String(r.installId).toLowerCase() === focusInstallId,
    );
    const localRow = localHit.installs.find((r) => r.installId.toLowerCase() === focusInstallId);
    userId =
      (typeof cloudRow?.cloudUserId === 'string' ? cloudRow.cloudUserId : '') ||
      localRow?.userId?.toLowerCase() ||
      '';
  }

  const user = userId ? await resolveUser(event, userId) : null;

  const [cloudInstalls, localInstalls] = await Promise.all([
    userId
      ? searchAccountsInstallLinksInterop(event, {
          q: '',
          cloudUserId: userId,
          page: 1,
          pageSize: 50,
        })
      : Promise.resolve({ installs: [] as Awaited<ReturnType<typeof searchAccountsInstallLinksInterop>>['installs'], total: 0, page: 1, pageSize: 50, totalPages: 1 }),
    userId
      ? searchLocalBsplusInstalls(db, { q: '', userId, page: 1, pageSize: 50 })
      : focusInstallId
        ? searchLocalBsplusInstalls(db, { q: focusInstallId, page: 1, pageSize: 10 })
        : Promise.resolve({ installs: [], total: 0 }),
  ]);

  let installs = mergeInstallMaps(cloudInstalls.installs, localInstalls.installs);

  if (!installs.length && focusInstallId) {
    const cloudOnly = await searchAccountsInstallLinksInterop(event, {
      q: focusInstallId,
      page: 1,
      pageSize: 5,
    });
    installs = mergeInstallMaps(cloudOnly.installs, localInstalls.installs);
  }

  const requestedInstallFocus = Boolean(input.installId?.trim());
  const focusType: 'user' | 'install' = requestedInstallFocus ? 'install' : 'user';
  const focusId =
    focusType === 'install'
      ? focusInstallId
      : userId || (user?.id ?? '') || focusInstallId;

  const installIds = installs.map((i) => i.installId);
  let overrides: Awaited<ReturnType<typeof listOverridesForClient>> = [];
  if (userId && UUID_RE.test(userId)) {
    overrides = await listOverridesForClient(db, { userId, installIds });
  } else if (focusInstallId) {
    overrides = await listOverrides(db, { scope: 'install', scopeId: focusInstallId, limit: 200 });
  }

  return {
    user,
    focus: { type: focusType, id: focusId },
    installs,
    overrides,
  };
}
