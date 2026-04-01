import { fetchAccountsUserInfo, getBearerOrCookieAccessToken } from '../../utils/accounts';

interface UserInfo {
  id: string;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  admin_level?: number;
  [key: string]: any;
}

export default defineEventHandler(async (event): Promise<UserInfo> => {
  const token = getBearerOrCookieAccessToken(event);

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  try {
    return await fetchAccountsUserInfo(event, token);
  } catch {
    deleteCookie(event, 'auth_token', { path: '/' });
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid Token',
    });
  }
});
