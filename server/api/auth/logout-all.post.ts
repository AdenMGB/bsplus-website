import { appendProxySetCookies, fetchAccountsSessionEndpoint, getBearerOrCookieAccessToken } from '../../utils/accounts';

export default defineEventHandler(async (event) => {
  const accessToken = getBearerOrCookieAccessToken(event);

  const { data, setCookie: proxiedCookies } = await fetchAccountsSessionEndpoint<{ success?: boolean }>(event, '/api/auth/logout-all', {
    method: 'POST',
    accessToken,
  });

  appendProxySetCookies(event, proxiedCookies);
  deleteCookie(event, 'auth_token', { path: '/' });

  return {
    success: data.success ?? true,
  };
});
