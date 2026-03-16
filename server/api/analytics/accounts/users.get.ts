/**
 * Accounts users analytics - admin only.
 * Fetches full user list from accounts.betterseqta.org and computes:
 * - Signups over time (daily)
 * - Cumulative signups
 * - Top email domains
 * Cloudflare: ACCOUNTS_API_KEY from wrangler secret or [vars].
 */
import { getHeader } from 'h3';
import { getAccountsApiCredentials } from '~/server/utils/accounts';

interface ExportUser {
  id: string;
  email?: string;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  admin_level?: number;
  is_admin?: number;
  created_at?: number;
  createdAt?: string;
}

interface UsersFullResponse {
  users: ExportUser[];
  count: number;
}

function extractEmailDomain(email: string | undefined): string {
  if (!email || typeof email !== 'string') return '(no email)';
  const at = email.indexOf('@');
  if (at === -1) return '(invalid)';
  const domain = email.slice(at + 1).toLowerCase().trim();
  return domain || '(empty)';
}

function getCreatedAtDate(u: ExportUser): Date | null {
  const ts = u.created_at;
  if (typeof ts === 'number' && ts > 0) return new Date(ts * 1000);
  const str = u.createdAt;
  if (typeof str === 'string') {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

export default defineEventHandler(async (event) => {
  const user = await $fetch<any>('/api/auth/me', {
    headers: { cookie: getHeader(event, 'cookie') || '' },
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const { apiKey, url: baseUrl } = getAccountsApiCredentials(event);

  if (!apiKey) {
    return {
      error: 'ACCOUNTS_API_KEY not configured',
      total: null,
      signupsOverTime: [],
      topDomains: [],
      adminCount: null,
    };
  }

  try {
    const res = await $fetch<UsersFullResponse>(`${baseUrl}/api/export/users/full`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      },
    });

    const users = res?.users || [];
    const total = users.length;

    // Daily signups: group by date (createdAt or created_at)
    const dailyMap = new Map<string, number>();
    for (const u of users) {
      const date = getCreatedAtDate(u);
      if (!date) continue;
      const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
      dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
    }

    // Sort dates and build signups over time (daily + cumulative)
    const sortedDates = [...dailyMap.keys()].sort();
    let cumulative = 0;
    const signupsOverTime = sortedDates.map((dateStr) => {
      const daily = dailyMap.get(dateStr) || 0;
      cumulative += daily;
      const timestamp = Math.floor(new Date(dateStr + 'T12:00:00Z').getTime() / 1000);
      return {
        date: dateStr,
        timestamp,
        daily_signups: daily,
        cumulative_signups: cumulative,
      };
    });

    // Top email domains
    const domainCount = new Map<string, number>();
    for (const u of users) {
      const domain = extractEmailDomain(u.email);
      domainCount.set(domain, (domainCount.get(domain) || 0) + 1);
    }
    const topDomains = [...domainCount.entries()]
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const adminCount = users.filter(
      (u) => (u.admin_level ?? 0) > 0 || (u.is_admin ?? 0) > 0
    ).length;

    return {
      error: null,
      total,
      signupsOverTime,
      topDomains,
      adminCount,
    };
  } catch (e: unknown) {
    const err = e as { data?: { error?: string }; message?: string };
    const message = err?.data?.error || err?.message || 'Failed to fetch users';
    return {
      error: message,
      total: null,
      signupsOverTime: [],
      topDomains: [],
      adminCount: null,
    };
  }
});
