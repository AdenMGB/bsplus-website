import type { H3Event } from 'h3';
import { getAccountsApiCredentials } from './accounts';

export interface FoundingEligibility {
  eligible: boolean;
  signup_number: number | null;
  is_founding_2500?: boolean;
  badges?: Array<{ badge_key: string; awarded_at?: number }>;
  displayName?: string;
  created_at?: number;
}

export interface SignupOrderUser {
  id: string;
  email: string;
  displayName?: string | null;
  username?: string | null;
  signup_number: number | null;
  created_at: number;
}

function accountsHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'X-API-Key': apiKey,
  };
}

export async function fetchFoundingEligibility(
  event: H3Event,
  userId: string
): Promise<FoundingEligibility> {
  const { apiKey, url } = await getAccountsApiCredentials(event);
  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'ACCOUNTS_API_KEY is not configured',
    });
  }

  try {
    return await $fetch<FoundingEligibility>(
      `${url}/api/v1/users/${encodeURIComponent(userId)}/eligibility/founding-2500`,
      { headers: accountsHeaders(apiKey) }
    );
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.response?.status;
    if (statusCode === 404) {
      return { eligible: false, signup_number: null };
    }
    throw error;
  }
}

export async function fetchSignupOrderExport(
  event: H3Event,
  limit = 2500,
  offset = 0
): Promise<{ users: SignupOrderUser[]; total?: number }> {
  const { apiKey, url } = await getAccountsApiCredentials(event);
  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'ACCOUNTS_API_KEY is not configured',
    });
  }

  const page = Math.floor(offset / limit) + 1;

  return await $fetch<{ users: SignupOrderUser[]; total?: number }>(
    `${url}/api/export/users/signup-order`,
    {
      headers: accountsHeaders(apiKey),
      query: { limit, page },
    }
  );
}
