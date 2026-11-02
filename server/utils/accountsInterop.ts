import type { H3Event } from 'h3';
import { getAccountsApiCredentials } from './accounts';

export type InteropUserSearchResult = {
  users: Array<{
    id: string;
    username: string;
    email: string;
    displayName: string | null;
    pfpUrl: string | null;
    signup_number: number | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type InteropInstallSearchResult = {
  installs: Array<Record<string, unknown>>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

async function interopFetch<T>(
  event: H3Event,
  path: string,
  query: Record<string, string | number | undefined>,
): Promise<T> {
  const { apiKey, url: accountsBase } = await getAccountsApiCredentials(event);
  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Accounts interop API key is not configured',
    });
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }

  const qs = params.toString();
  const target = `${accountsBase}${path}${qs ? `?${qs}` : ''}`;

  return await $fetch<T>(target, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });
}

export async function searchAccountsUsersInterop(
  event: H3Event,
  input: { q: string; page?: number; pageSize?: number },
): Promise<InteropUserSearchResult> {
  const res = await interopFetch<{ success: boolean; data: InteropUserSearchResult }>(
    event,
    '/api/v1/bsplus/users/search',
    {
      q: input.q,
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 20,
    },
  );
  return res.data;
}

export async function searchAccountsInstallLinksInterop(
  event: H3Event,
  input: { q: string; page?: number; pageSize?: number; cloudUserId?: string | null },
): Promise<InteropInstallSearchResult> {
  const res = await interopFetch<{ success: boolean; data: InteropInstallSearchResult }>(
    event,
    '/api/v1/bsplus/installs/search',
    {
      q: input.q,
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 20,
      cloudUserId: input.cloudUserId ?? undefined,
    },
  );
  return res.data;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function searchLocalBsplusInstalls(
  db: {
    prepare: (sql: string) => {
      bind: (...args: unknown[]) => {
        all: () => Promise<{ results?: unknown[] }>;
        first: <T>() => Promise<T | null>;
      };
    };
  },
  input: { q: string; page?: number; pageSize?: number; userId?: string | null },
): Promise<{
  installs: Array<{
    installId: string;
    userId: string | null;
    extensionVersion: string | null;
    channel: string | null;
    browser: string | null;
    hostname: string | null;
    lastSeenAt: number | null;
    source: 'website_register';
  }>;
  total: number;
}> {
  const pageSize = Math.min(Math.max(input.pageSize ?? 20, 1), 50);
  const page = Math.max(input.page ?? 1, 1);
  const offset = (page - 1) * pageSize;
  const trimmed = input.q.trim().toLowerCase();
  const like = `%${trimmed}%`;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (input.userId && UUID_RE.test(input.userId.trim())) {
    conditions.push('user_id = ?');
    params.push(input.userId.trim().toLowerCase());
  }

  if (trimmed) {
    if (UUID_RE.test(trimmed)) {
      conditions.push('(install_id = ? OR user_id = ? OR install_id LIKE ? OR user_id LIKE ?)');
      params.push(trimmed, trimmed, like, like);
    } else {
      conditions.push('(install_id LIKE ? OR user_id LIKE ? OR extension_version LIKE ? OR hostname LIKE ?)');
      params.push(like, like, like, like);
    }
  }

  const whereClause = conditions.length ? conditions.join(' AND ') : '1=1';

  const totalRow = await db
    .prepare(`SELECT COUNT(*) AS count FROM bsplus_installs WHERE ${whereClause}`)
    .bind(...params)
    .first<{ count: number }>();

  const rows = await db
    .prepare(
      `SELECT install_id, user_id, extension_version, channel, browser, hostname, last_seen_at
       FROM bsplus_installs
       WHERE ${whereClause}
       ORDER BY last_seen_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(...params, pageSize, offset)
    .all();

  const installs = ((rows.results ?? []) as Array<{
    install_id: string;
    user_id: string | null;
    extension_version: string | null;
    channel: string | null;
    browser: string | null;
    hostname: string | null;
    last_seen_at: number | null;
  }>).map((row) => ({
    installId: row.install_id,
    userId: row.user_id,
    extensionVersion: row.extension_version,
    channel: row.channel,
    browser: row.browser,
    hostname: row.hostname,
    lastSeenAt: row.last_seen_at,
    source: 'website_register' as const,
  }));

  return { installs, total: totalRow?.count ?? 0 };
}
