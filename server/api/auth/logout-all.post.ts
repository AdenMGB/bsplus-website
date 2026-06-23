import { getBearerOrCookieAccessToken } from '../../utils/accounts';
import { AUTH_REFRESH_COOKIE_NAME, AUTH_TOKEN_COOKIE_NAME } from '~/utils/auth-session';

export default defineEventHandler(async (event) => {
  const accessToken = getBearerOrCookieAccessToken(event);

  if (accessToken) {
    try {
      await $fetch('https://accounts.betterseqta.org/api/auth/sessions/revoke-others', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: getHeader(event, 'cookie') || '',
        },
      });
    } catch {
      // Best-effort remote revoke
    }
  }

  deleteCookie(event, AUTH_TOKEN_COOKIE_NAME, { path: '/' });
  deleteCookie(event, AUTH_REFRESH_COOKIE_NAME, { path: '/' });

  return { success: true };
});
