import { appendProxySetCookies, fetchAccountsSessionEndpoint } from '../../utils/accounts';

export default defineEventHandler(async (event) => {
  const { data, setCookie: proxiedCookies } = await fetchAccountsSessionEndpoint<{ success?: boolean }>(event, '/api/auth/logout', {
    method: 'POST',
  });

  appendProxySetCookies(event, proxiedCookies);
  deleteCookie(event, 'auth_token', { path: '/' });

  return {
    success: data.success ?? true,
  };
});
