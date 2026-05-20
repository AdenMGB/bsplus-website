import { appendProxySetCookies, fetchAccountsSessionEndpoint } from '../../utils/accounts';
import { getAuthTokenCookieSetOptions } from '~/utils/auth-session';

interface RefreshResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
  [key: string]: any;
}

export default defineEventHandler(async (event): Promise<RefreshResponse> => {
  const { data, setCookie: proxiedCookies } = await fetchAccountsSessionEndpoint<RefreshResponse>(event, '/api/auth/refresh', {
    method: 'POST',
  });

  appendProxySetCookies(event, proxiedCookies);

  if (data.access_token) {
    setCookie(event, 'auth_token', data.access_token, getAuthTokenCookieSetOptions());
  }

  return data;
});
