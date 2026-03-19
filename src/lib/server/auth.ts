import { redirect, type RequestEvent } from '@sveltejs/kit';

export interface UserInfo {
  id: string;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  admin_level?: number;
  [key: string]: unknown;
}

export async function getUserFromRequest(event: RequestEvent): Promise<UserInfo | null> {
  const token = event.cookies.get('auth_token') ?? event.request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  try {
    const response = await fetch('https://accounts.betterseqta.org/api/oauth/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      event.cookies.delete('auth_token', { path: '/' });
      return null;
    }

    const user = (await response.json()) as UserInfo;
    if (user.pfpUrl?.startsWith('/pfp/')) {
      user.pfpUrl = `https://accounts.betterseqta.org${user.pfpUrl}`;
    } else if (user.pfpUrl?.startsWith('https://betterseqta.org/pfp/')) {
      user.pfpUrl = user.pfpUrl.replace('https://betterseqta.org/pfp/', 'https://accounts.betterseqta.org/pfp/');
    }

    return user;
  } catch {
    return null;
  }
}

export async function requireAdminPage(event: RequestEvent) {
  if (!event.locals.user || !event.locals.user.admin_level || event.locals.user.admin_level < 1) {
    redirect(307, '/');
  }
}
