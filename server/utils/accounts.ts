import type { H3Event } from 'h3';
import { getRequestHost } from 'h3';
import { getSiteIntegrationSettings } from './site-integrations';

const PRODUCTION_ACCOUNTS_URL = 'https://accounts.betterseqta.org';

/** @deprecated Use getAccountsOAuthBaseUrl() — kept for gradual migration */
export const ACCOUNTS_OAUTH_BASE_URL = PRODUCTION_ACCOUNTS_URL;

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

function getCloudflareEnv(event?: H3Event | null) {
  return (
    (event as any)?.context?.cloudflare?.env ??
    (event as any)?.req?.runtime?.cloudflare?.env ??
    (globalThis as any).__env__ ??
    null
  );
}

export function isLocalServiceUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.localhost')
    );
  } catch {
    return false;
  }
}

export function isLocalRequest(event?: H3Event | null): boolean {
  if (!event) return false;
  try {
    const host = getRequestHost(event, { xForwardedHost: true }) || '';
    return (
      host.startsWith('localhost') ||
      host.startsWith('127.0.0.1') ||
      host.includes('.localhost')
    );
  } catch {
    return false;
  }
}

export function isLocalDev(event?: H3Event | null): boolean {
  if (process.env.NODE_ENV === 'development' || process.env.CF_DEV === '1') {
    return true;
  }
  const cfEnv = getCloudflareEnv(event);
  if (cfEnv?.CF_DEV === '1' || cfEnv?.NODE_ENV === 'development') {
    return true;
  }
  if (isLocalRequest(event)) {
    return true;
  }
  const devAccounts = readDevServiceUrl('DEV_ACCOUNTS_URL', event);
  return Boolean(devAccounts && isLocalServiceUrl(devAccounts));
}

function readDevServiceUrl(
  key: 'DEV_ACCOUNTS_URL' | 'DEV_BSPLUS_URL' | 'DEV_MAIL_URL',
  event?: H3Event | null,
): string | null {
  const cfEnv = getCloudflareEnv(event);
  const raw =
    cfEnv?.[key] ??
    process.env[key] ??
    null;
  return raw ? String(raw).replace(/\/$/, '') : null;
}

export function getAccountsOAuthBaseUrl(event?: H3Event | null): string {
  const devUrl = readDevServiceUrl('DEV_ACCOUNTS_URL', event);
  if (devUrl && (isLocalDev(event) || isLocalServiceUrl(devUrl))) {
    return devUrl;
  }
  if (isLocalDev(event) || isLocalRequest(event)) {
    return 'http://localhost:8788';
  }
  return PRODUCTION_ACCOUNTS_URL;
}

export async function getAccountsApiCredentials(event?: H3Event | null): Promise<AccountsCredentials> {
  const cfEnv = getCloudflareEnv(event);
  const devAccountsUrl = readDevServiceUrl('DEV_ACCOUNTS_URL', event);
  const productionFallback = PRODUCTION_ACCOUNTS_URL;

  let storedApiKey = '';
  if (event) {
    try {
      const stored = await getSiteIntegrationSettings(event);
      storedApiKey = stored.accountsApiKey;
    } catch {
      // D1 unavailable during build or tests
    }
  }

  const apiKey =
    storedApiKey
    || String(
      cfEnv?.ACCOUNTS_API_KEY
      ?? cfEnv?.NUXT_ACCOUNTS_API_KEY
      ?? process.env.ACCOUNTS_API_KEY
      ?? process.env.NUXT_ACCOUNTS_API_KEY
      ?? (() => {
        try {
          return useRuntimeConfig(event as H3Event).accountsApiKey as string;
        } catch {
          return '';
        }
      })()
      ?? '',
    );

  let url =
    cfEnv?.ACCOUNTS_API_URL ??
    cfEnv?.NUXT_ACCOUNTS_API_URL ??
    process.env.ACCOUNTS_API_URL ??
    process.env.NUXT_ACCOUNTS_API_URL ??
    (() => {
      try {
        return useRuntimeConfig(event as H3Event).accountsApiUrl as string;
      } catch {
        return productionFallback;
      }
    })() ??
    productionFallback;

  if (isLocalDev(event) && devAccountsUrl) {
    url = devAccountsUrl;
  } else if ((isLocalDev(event) || isLocalRequest(event)) && !url.includes('localhost')) {
    url = 'http://localhost:8788';
  }

  return {
    apiKey: String(apiKey || '').trim(),
    url: String(url || productionFallback).replace(/\/$/, ''),
  };
}

export function normalizeAccountsUser(user: AccountsUserInfo, event?: H3Event | null): AccountsUserInfo {
  const accountsBase = getAccountsOAuthBaseUrl(event);

  if (!user.pfpUrl) {
    return user;
  }

  user.pfpUrl = user.pfpUrl.replace(
    'https://betterseqta.org/pfp/',
    `${accountsBase}/pfp/`,
  );

  if (user.pfpUrl.startsWith('/pfp/')) {
    user.pfpUrl = `${accountsBase}${user.pfpUrl}`;
  }

  return user;
}

export async function fetchAccountsUserInfo(event: H3Event, accessToken: string): Promise<AccountsUserInfo> {
  const accountsBase = getAccountsOAuthBaseUrl(event);
  const user = await $fetch<AccountsUserInfo>(`${accountsBase}/api/oauth/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return normalizeAccountsUser(user, event);
}

export async function exchangeAccountsAuthorizationCode(
  event: H3Event,
  code: string,
  redirectUri: string
): Promise<AccountsTokenResponse> {
  const config = useRuntimeConfig(event);
  const accountsBase = getAccountsOAuthBaseUrl(event);

  const tokenResponse = await $fetch<AccountsTokenResponse>(`${accountsBase}/api/oauth/token`, {
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
  const { apiKey } = await getAccountsApiCredentials(event);
  const accountsBase = getAccountsOAuthBaseUrl(event);
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

  const response = await fetch(`${accountsBase}${path}`, {
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
