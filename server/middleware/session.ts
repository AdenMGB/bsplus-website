import { getHeader } from 'h3';
import { isApiRequestPath } from '../utils/cors';
import { refreshSession } from '../utils/refreshSession';
import { AUTH_REFRESH_COOKIE_NAME, AUTH_TOKEN_COOKIE_NAME, isJwtExpired } from '~/utils/auth-session';

// Server-rendered pages forward the incoming cookie to their own API calls, so an expired
// access token must be refreshed here, before rendering, or every admin request fails.
export default defineEventHandler(async (event) => {
  if (isApiRequestPath(event) || !getHeader(event, 'accept')?.includes('text/html')) return;

  const token = getCookie(event, AUTH_TOKEN_COOKIE_NAME);
  if (!getCookie(event, AUTH_REFRESH_COOKIE_NAME) || (token && !isJwtExpired(token))) return;

  const session = await refreshSession(event).catch(() => null);
  if (!session) return;

  const cookies = parseCookies(event);
  cookies[AUTH_TOKEN_COOKIE_NAME] = session.access_token;
  if (session.refresh_token) cookies[AUTH_REFRESH_COOKIE_NAME] = session.refresh_token;
  event.node.req.headers.cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('; ');
});
