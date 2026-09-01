import { getAccountsOAuthBaseUrl } from '../../utils/accounts';
import {
  AUTH_REFRESH_COOKIE_NAME,
  AUTH_TOKEN_COOKIE_NAME,
  getAuthRefreshCookieSetOptions,
  getAuthTokenCookieSetOptions,
} from '~/utils/auth-session';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const refreshToken = getCookie(event, AUTH_REFRESH_COOKIE_NAME);

  if (refreshToken && config.oauthClientId && config.oauthClientSecret) {
    try {
      await $fetch(`${getAccountsOAuthBaseUrl(event)}/api/oauth/revoke`, {
        method: 'POST',
        body: {
          refresh_token: refreshToken,
          client_id: config.oauthClientId,
          client_secret: config.oauthClientSecret,
        },
      });
    } catch {
      // Best-effort revoke; still clear local cookies
    }
  }

  deleteCookie(event, AUTH_TOKEN_COOKIE_NAME, { path: '/' });
  deleteCookie(event, AUTH_REFRESH_COOKIE_NAME, { path: '/' });

  return { success: true };
});
