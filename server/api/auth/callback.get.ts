import { appendProxySetCookies, exchangeAccountsAuthorizationCode } from '../../utils/accounts';
import { getAuthTokenCookieSetOptions } from '~/utils/auth-session';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawCode = query.code;
  const code = typeof rawCode === 'string' ? rawCode : null;
  const redirectUri = process.env.NUXT_OAUTH_REDIRECT_URI || 'http://localhost:8787/api/auth/callback';

  if (!code) {
    return sendRedirect(event, '/?error=no_code');
  }

  try {
    const tokenResponse = await exchangeAccountsAuthorizationCode(event, code, redirectUri);
    const accessToken = tokenResponse.access_token;

    setCookie(event, 'auth_token', accessToken, getAuthTokenCookieSetOptions());

    const forwardedCookies = Array.isArray(tokenResponse.setCookie) ? tokenResponse.setCookie : [];
    appendProxySetCookies(event, forwardedCookies);

    return sendRedirect(event, '/');
  } catch (e) {
    console.error('OAuth Callback Error:', e);
    return sendRedirect(event, '/?error=server_error');
  }
});
