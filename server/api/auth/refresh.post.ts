import { appendProxySetCookies, fetchAccountsSessionEndpoint } from '../../utils/accounts';

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
    setCookie(event, 'auth_token', data.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: data.expires_in || 3600,
    });
  }

  return data;
});
