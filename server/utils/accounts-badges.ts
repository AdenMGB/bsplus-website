import type { H3Event } from 'h3';
import { getAccountsApiCredentials } from './accounts';

export const THEME_SUBMITTER_BADGE_KEY = 'theme_submitter';

export type AccountsBadgeRow = {
  key?: string;
  badge_key?: string;
  label?: string;
  awarded_at?: number;
};

function accountsHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'X-API-Key': apiKey,
    'Content-Type': 'application/json',
  };
}

function badgeKeyFromRow(row: AccountsBadgeRow): string | null {
  const key = row.badge_key ?? row.key;
  return typeof key === 'string' && key.trim() ? key.trim() : null;
}

export async function fetchUserBadges(
  event: H3Event,
  userId: string
): Promise<AccountsBadgeRow[]> {
  const { apiKey, url } = await getAccountsApiCredentials(event);
  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'ACCOUNTS_API_KEY is not configured',
    });
  }

  const res = await $fetch<{ badges?: AccountsBadgeRow[] }>(
    `${url}/api/v1/users/badges/${encodeURIComponent(userId)}`,
    { headers: accountsHeaders(apiKey) }
  );

  return res.badges ?? [];
}

export async function userHasAchievementBadge(
  event: H3Event,
  userId: string,
  badgeKey: string
): Promise<boolean> {
  const badges = await fetchUserBadges(event, userId);
  return badges.some((row) => badgeKeyFromRow(row) === badgeKey);
}

export async function awardUserBadge(
  event: H3Event,
  userId: string,
  badgeKey: string
): Promise<{ created?: boolean; awarded?: boolean }> {
  const { apiKey, url } = await getAccountsApiCredentials(event);
  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'ACCOUNTS_API_KEY is not configured',
    });
  }

  return await $fetch<{ created?: boolean; awarded?: boolean }>(
    `${url}/api/v1/users/${encodeURIComponent(userId)}/badges`,
    {
      method: 'POST',
      headers: accountsHeaders(apiKey),
      body: { badge_key: badgeKey },
    }
  );
}

export type EnsureThemeSubmitterBadgeResult = {
  attempted: boolean;
  awarded: boolean;
  already_had_badge: boolean;
  skipped_reason?: 'missing_author_id' | 'missing_api_key' | 'accounts_error';
  error?: string;
};

/**
 * Grant theme_submitter on Accounts when a community theme is approved.
 * Does not throw — approval must succeed even if Accounts is down or misconfigured.
 */
export async function ensureThemeSubmitterBadge(
  event: H3Event,
  accountsUserId: string
): Promise<EnsureThemeSubmitterBadgeResult> {
  const userId = accountsUserId?.trim();
  if (!userId) {
    return {
      attempted: false,
      awarded: false,
      already_had_badge: false,
      skipped_reason: 'missing_author_id',
    };
  }

  const { apiKey } = await getAccountsApiCredentials(event);
  if (!apiKey) {
    console.warn(
      '[accounts-badges] ACCOUNTS_API_KEY not configured; skipping theme_submitter badge'
    );
    return {
      attempted: false,
      awarded: false,
      already_had_badge: false,
      skipped_reason: 'missing_api_key',
    };
  }

  try {
    const hasBadge = await userHasAchievementBadge(event, userId, THEME_SUBMITTER_BADGE_KEY);
    if (hasBadge) {
      return {
        attempted: true,
        awarded: false,
        already_had_badge: true,
      };
    }

    const result = await awardUserBadge(event, userId, THEME_SUBMITTER_BADGE_KEY);
    const created = result.created === true || result.awarded === true;

    return {
      attempted: true,
      awarded: created,
      already_had_badge: result.created === false,
    };
  } catch (error: unknown) {
    const message =
      error && typeof error === 'object' && 'statusMessage' in error
        ? String((error as { statusMessage?: string }).statusMessage)
        : error instanceof Error
          ? error.message
          : 'Unknown error';

    console.warn(
      `[accounts-badges] Failed to award ${THEME_SUBMITTER_BADGE_KEY} to ${userId}:`,
      message
    );

    return {
      attempted: true,
      awarded: false,
      already_had_badge: false,
      skipped_reason: 'accounts_error',
      error: message,
    };
  }
}
