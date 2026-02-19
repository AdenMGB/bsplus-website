import type { H3Event } from 'h3';

export interface UserInfo {
  id: string;
  username: string;
  admin_level?: number;
  [key: string]: any;
}

function authHeaders(event: H3Event): Record<string, string> {
  const headers: Record<string, string> = {
    cookie: getHeader(event, 'cookie') || ''
  };
  const auth = getHeader(event, 'authorization');
  if (auth) headers.authorization = auth;
  return headers;
}

export async function requireAdmin(event: H3Event): Promise<UserInfo> {
  const user = await $fetch<UserInfo>('/api/auth/me', {
    headers: authHeaders(event)
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
      headers: authHeaders(event)
    });
    return user;
  } catch {
    return null;
  }
}
