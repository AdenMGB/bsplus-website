import type { H3Event } from 'h3';
import { getAccountsApiCredentials } from './accounts';

export type AccountsExportUser = {
  id: string;
  email?: string;
  displayName?: string;
  username?: string;
};

function accountsHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'X-API-Key': apiKey,
  };
}

const exportUserMapKey = '__accountsExportUserById';

async function loadAccountsExportUserMap(event: H3Event): Promise<Map<string, AccountsExportUser>> {
  const ctx = event.context as Record<string, unknown>;
  const cached = ctx[exportUserMapKey] as Map<string, AccountsExportUser> | undefined;
  if (cached) return cached;

  const { apiKey, url } = await getAccountsApiCredentials(event);
  if (!apiKey) {
    const empty = new Map<string, AccountsExportUser>();
    ctx[exportUserMapKey] = empty;
    return empty;
  }

  const res = await $fetch<{ users?: AccountsExportUser[] }>(`${url}/api/export/users/full`, {
    headers: accountsHeaders(apiKey),
  });

  const map = new Map<string, AccountsExportUser>();
  for (const user of res.users ?? []) {
    if (user?.id) map.set(user.id, user);
  }
  ctx[exportUserMapKey] = map;
  return map;
}

export async function fetchAccountsUserById(
  event: H3Event,
  userId: string
): Promise<AccountsExportUser | null> {
  const id = userId?.trim();
  if (!id) return null;
  const map = await loadAccountsExportUserMap(event);
  return map.get(id) ?? null;
}