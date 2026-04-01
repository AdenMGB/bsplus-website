import type { H3Event } from 'h3';

export interface AccountsCredentials {
  apiKey: string;
  url: string;
}

export interface AccountsTokenResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
  refresh_token?: string;
  error?: string;
  [key: string]: any;
}

export interface AccountsUserInfo {
  id: string;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  admin_level?: number;
  [key: string]: any;
}

function getCloudflareEnv(event: H3Event) {
  return (
    (event as any).context?.cloudflare?.env ??
    (event as any).req?.runtime?.cloudflare?.env ??
    null
  );
}

export function getAccountsApiCredentials(event: H3Event): AccountsCredentials {
  const cfEnv = getCloudflareEnv(event);

  const apiKey =
    cfEnv?.ACCOUNTS_API_KEY ??
    cfEnv?.NUXT_ACCOUNTS_API_KEY ??
    process.env.ACCOUNTS_API_KEY ??
    process.env.NUXT_ACCOUNTS_API_KEY ??
    (useRuntimeConfig().accountsApiKey as string) ??
    '';

  const url =
    cfEnv?.ACCOUNTS_API_URL ??
    cfEnv?.NUXT_ACCOUNTS_API_URL ??
    process.env.ACCOUNTS_API_URL ??
    process.env.NUXT_ACCOUNTS_API_URL ??
    (useRuntimeConfig().accountsApiUrl as string) ??
    'https://accounts.betterseqta.org';

  return {
    apiKey: String(apiKey || '').trim(),
    url: String(url || 'https://accounts.betterseqta.org').replace(/\/$/, ''),
  };
}

export function normalizeAccountsUser(user: AccountsUserInfo): AccountsUserInfo {
  if (!user.pfpUrl) {
    return user;
  }

  user.pfpUrl = user.pfpUrl.replace(
    'https://betterseqta.org/pfp/',
    'https://accounts.betterseqta.org/pfp/'
  );

  if (user.pfpUrl.startsWith('/pfp/')) {
    user.pfpUrl = `https://accounts.betterseqta.org${user.pfpUrl}`;
  }

  return user;
}

export async function fetchAccountsUserInfo(event: H3Event, accessToken: string): Promise<AccountsUserInfo> {
  const { url } = getAccountsApiCredentials(event);
  const user = await $fetch<AccountsUserInfo>(`${url}/api/oauth/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return normalizeAccountsUser(user);
}

export async function exchangeAccountsAuthorizationCode(
  event: H3Event,
  code: string,
  redirectUri: string
): Promise<AccountsTokenResponse> {
  const config = useRuntimeConfig(event);
  const { url } = getAccountsApiCredentials(event);

  const tokenResponse = await $fetch<AccountsTokenResponse>(`${url}/api/oauth/token`, {
    method: 'POST',
    body: {
      client_id: config.oauthClientId,
      client_secret: config.oauthClientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    },
  });

  if (tokenResponse.error || !tokenResponse.access_token) {
    throw createError({
      statusCode: 401,
      statusMessage: tokenResponse.error || 'OAuth exchange failed',
    });
  }

  return tokenResponse;
}

export function getIncomingCookieHeader(event: H3Event) {
  return getHeader(event, 'cookie') || '';
}

export async function fetchAccountsSessionEndpoint<T>(
  event: H3Event,
  path: string,
  options: {
    method?: 'GET' | 'POST';
    body?: Record<string, any>;
    accessToken?: string | null;
    includeApiKey?: boolean;
  } = {}
): Promise<{ data: T; setCookie: string[] }> {
  const { url, apiKey } = getAccountsApiCredentials(event);
  const headers = new Headers();
  const cookieHeader = getIncomingCookieHeader(event);

  if (cookieHeader) {
    headers.set('cookie', cookieHeader);
  }

  if (options.accessToken) {
    headers.set('authorization', `Bearer ${options.accessToken}`);
  }

  if (options.includeApiKey && apiKey) {
    headers.set('x-api-key', apiKey);
  }

  const response = await fetch(`${url}${path}`, {
    method: options.method || 'POST',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) as T : {} as T;
  const setCookie = response.headers.getSetCookie?.() || [];

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: (data as any)?.error || (data as any)?.message || response.statusText,
      data,
    });
  }

  return { data, setCookie };
}

export function appendProxySetCookies(event: H3Event, cookies: string[]) {
  if (!cookies.length) {
    return;
  }

  for (const cookie of cookies) {
    appendResponseHeader(event, 'set-cookie', cookie);
  }
}

export function getBearerOrCookieAccessToken(event: H3Event) {
  const authHeader = getHeader(event, 'authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  return bearerToken || getCookie(event, 'auth_token') || null;
}
