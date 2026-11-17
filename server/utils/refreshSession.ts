import type { H3Event } from 'h3';
import { getAccountsOAuthBaseUrl } from './accounts';
import {
  AUTH_REFRESH_COOKIE_NAME,
  AUTH_TOKEN_COOKIE_NAME,
  getAuthRefreshCookieSetOptions,
  getAuthTokenCookieSetOptions,
} from '~/utils/auth-session';

interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export async function refreshSession(event: H3Event): Promise<RefreshResponse> {
  const config = useRuntimeConfig(event);
  const refreshToken = getCookie(event, AUTH_REFRESH_COOKIE_NAME);

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing refresh token',
    });
  }

  const data = await $fetch<RefreshResponse>(`${getAccountsOAuthBaseUrl(event)}/api/oauth/refresh`, {
    method: 'POST',
    body: {
      refresh_token: refreshToken,
      client_id: config.oauthClientId,
      client_secret: config.oauthClientSecret,
    },
  });

  if (!data.access_token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Refresh failed',
    });
  }

  setCookie(event, AUTH_TOKEN_COOKIE_NAME, data.access_token, getAuthTokenCookieSetOptions());

  if (data.refresh_token) {
    setCookie(event, AUTH_REFRESH_COOKIE_NAME, data.refresh_token, getAuthRefreshCookieSetOptions());
  }

  return data;
}
