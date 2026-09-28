import { getAccountsOAuthBaseUrl } from '../../utils/accounts';
import {
  AUTH_REDIRECT_COOKIE_NAME,
  getAuthRedirectCookieSetOptions,
  sanitizeAuthRedirectPath,
} from '~/utils/auth-session';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const redirectUri = config.oauthRedirectUri;

  if (!config.oauthClientId?.trim()) {
    throw createError({
      statusCode: 503,
      statusMessage:
        'OAuth is not configured for local dev. Set NUXT_OAUTH_CLIENT_ID and NUXT_OAUTH_CLIENT_SECRET in .env (register a dev client at http://localhost:8788).',
    });
  }

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

  const accountsBase = getAccountsOAuthBaseUrl(event);
  return sendRedirect(event, `${accountsBase}/oauth/authorize?${params.toString()}`, 302);
});
