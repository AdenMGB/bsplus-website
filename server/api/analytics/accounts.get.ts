/**
 * Accounts analytics - admin only.
 * Proxies to accounts.betterseqta.org export API.
 * Requires ACCOUNTS_API_KEY in env (Cloudflare: set via wrangler secret or [vars]).
 */
import { getHeader } from 'h3';
import { getAccountsApiCredentials } from '~/server/utils/accounts';

interface AccountsApiResult {
  error: string | null;
  total?: number | null;
  count?: number | null;
}

async function fetchAccountsApi(
  path: string,
  credentials: { apiKey: string; url: string }
): Promise<AccountsApiResult> {
  const { apiKey, url } = credentials;

  if (!apiKey) {
    return { error: 'ACCOUNTS_API_KEY not configured', total: null, count: null };
  }

  try {
    const res = await $fetch<{ total?: number; count?: number }>(`${url}/api/export${path}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      },
    });
    return { ...res, error: null };
  } catch (e: unknown) {
    const err = e as { statusCode?: number; status?: number; data?: { error?: string }; message?: string };
    const message = err?.data?.error || err?.message || 'Failed to fetch';
    return {
      error: message,
      total: null,
      count: null,
    };
  }
}

export default defineEventHandler(async (event) => {
  const user = await $fetch<any>('/api/auth/me', {
    headers: { cookie: getHeader(event, 'cookie') || '' },
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const credentials = getAccountsApiCredentials(event);

  const [usersCount, reservedClients]: [AccountsApiResult, AccountsApiResult] = await Promise.all([
    fetchAccountsApi('/users/count', credentials),
    fetchAccountsApi('/reserved-clients', credentials),
  ]);

  return {
    users: {
      total: usersCount.total ?? null,
      error: usersCount.error,
    },
    reservedClients: {
      count: reservedClients.count ?? null,
      error: reservedClients.error,
    },
  };
});
