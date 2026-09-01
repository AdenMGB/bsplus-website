import type { H3Event } from 'h3';
import { fetchAccountsUserInfo, getBearerOrCookieAccessToken } from './accounts';

export interface UserInfo {
  id: string;
  username: string;
  admin_level?: number;
  [key: string]: any;
}

export async function getOptionalUser(event: H3Event): Promise<UserInfo | null> {
  const token = getBearerOrCookieAccessToken(event);
  if (!token) return null;

  try {
    return await fetchAccountsUserInfo(event, token);
  } catch {
    return null;
  }
}

export async function requireAdmin(event: H3Event): Promise<UserInfo> {
  const user = await getOptionalUser(event);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden - Admin access required',
    });
  }

  return user;
}
