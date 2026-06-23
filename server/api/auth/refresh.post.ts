import { ACCOUNTS_OAUTH_BASE_URL } from '../../utils/accounts';
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

export default defineEventHandler(async (event): Promise<{ access_token: string; expires_in?: number; token_type?: string }> => {
  const config = useRuntimeConfig(event);
  const refreshToken = getCookie(event, AUTH_REFRESH_COOKIE_NAME);

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing refresh token',
    });
  }

  const data = await $fetch<RefreshResponse>(`${ACCOUNTS_OAUTH_BASE_URL}/api/oauth/refresh`, {
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

  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
    token_type: data.token_type,
  };
});
