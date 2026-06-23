import { exchangeAccountsAuthorizationCode } from '../../utils/accounts';
import {
  AUTH_REDIRECT_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
  AUTH_TOKEN_COOKIE_NAME,
  getAuthRefreshCookieSetOptions,
  getAuthTokenCookieSetOptions,
  sanitizeAuthRedirectPath,
} from '~/utils/auth-session';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawCode = query.code;
  const code = typeof rawCode === 'string' ? rawCode : null;
  const redirectUri = process.env.NUXT_OAUTH_REDIRECT_URI || 'http://localhost:8787/api/auth/callback';

  if (!code) {
    return sendRedirect(event, '/?error=no_code');
  }

  const savedRedirect = getCookie(event, AUTH_REDIRECT_COOKIE_NAME);
  deleteCookie(event, AUTH_REDIRECT_COOKIE_NAME, { path: '/' });
  const destination = sanitizeAuthRedirectPath(savedRedirect);

  try {
    const tokenResponse = await exchangeAccountsAuthorizationCode(event, code, redirectUri);
    const accessToken = tokenResponse.access_token;

    setCookie(event, AUTH_TOKEN_COOKIE_NAME, accessToken, getAuthTokenCookieSetOptions());

    if (tokenResponse.refresh_token) {
      setCookie(event, AUTH_REFRESH_COOKIE_NAME, tokenResponse.refresh_token, getAuthRefreshCookieSetOptions());
    }

    return sendRedirect(event, destination);
  } catch (e) {
    console.error('OAuth Callback Error:', e);
    return sendRedirect(event, '/?error=server_error');
  }
});
