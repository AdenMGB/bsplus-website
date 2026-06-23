import { ACCOUNTS_OAUTH_BASE_URL } from '../../utils/accounts';
import {
  AUTH_REDIRECT_COOKIE_NAME,
  getAuthRedirectCookieSetOptions,
  sanitizeAuthRedirectPath,
} from '~/utils/auth-session';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const redirectUri = process.env.NUXT_OAUTH_REDIRECT_URI || 'http://localhost:8787/api/auth/callback';

  const query = getQuery(event);
  const redirectPath = sanitizeAuthRedirectPath(
    typeof query.redirect === 'string' ? query.redirect : undefined,
  );

  if (redirectPath !== '/') {
    setCookie(event, AUTH_REDIRECT_COOKIE_NAME, redirectPath, getAuthRedirectCookieSetOptions());
  }

  const params = new URLSearchParams({
    client_id: config.oauthClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
  });

  return sendRedirect(event, `${ACCOUNTS_OAUTH_BASE_URL}/oauth/authorize?${params.toString()}`);
});
