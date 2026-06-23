import { fetchAccountsUserInfo, getBearerOrCookieAccessToken } from '../../utils/accounts';
import { AUTH_TOKEN_COOKIE_NAME } from '~/utils/auth-session';

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
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.response?.status || error?.status;
    if (statusCode === 401) {
      deleteCookie(event, AUTH_TOKEN_COOKIE_NAME, { path: '/' });
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid Token',
      });
    }
    throw error;
  }
});
