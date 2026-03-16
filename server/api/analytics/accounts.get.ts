/**
 * Accounts analytics - admin only.
 * Proxies to accounts.betterseqta.org export API.
 * Requires ACCOUNTS_API_KEY in env.
 */
import { getHeader } from 'h3';

interface AccountsApiResult {
  error: string | null;
  total?: number | null;
  count?: number | null;
}

async function fetchAccountsApi(path: string, config: ReturnType<typeof useRuntimeConfig>): Promise<AccountsApiResult> {
  const apiKey = config.accountsApiKey as string;
  const baseUrl = ((config.accountsApiUrl as string) || 'https://accounts.betterseqta.org').replace(/\/$/, '');

  if (!apiKey) {
    return { error: 'ACCOUNTS_API_KEY not configured', total: null, count: null };
  }

  try {
    const res = await $fetch<{ total?: number; count?: number }>(`${baseUrl}/api/export${path}`, {
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

  const config = useRuntimeConfig();

  const [usersCount, reservedClients]: [AccountsApiResult, AccountsApiResult] = await Promise.all([
    fetchAccountsApi('/users/count', config),
    fetchAccountsApi('/reserved-clients', config),
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
