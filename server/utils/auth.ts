import type { H3Event } from 'h3';

export interface UserInfo {
  id: string;
  username: string;
  admin_level?: number;
  [key: string]: any;
}

export async function requireAdmin(event: H3Event): Promise<UserInfo> {
  const user = await $fetch<UserInfo>('/api/auth/me', {
    headers: {
      cookie: getHeader(event, 'cookie') || ''
    }
  }).catch(() => null);

  if (!user || !user.admin_level || user.admin_level < 1) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden - Admin access required'
    });
  }

  return user;
}

export async function getOptionalUser(event: H3Event): Promise<UserInfo | null> {
  try {
    const user = await $fetch<UserInfo>('/api/auth/me', {
      headers: {
        cookie: getHeader(event, 'cookie') || ''
      }
    });
    return user;
  } catch {
    return null;
  }
}
