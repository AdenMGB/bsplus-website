interface UserInfo {
  id: string;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  admin_level?: number;
  [key: string]: any;
}

export default defineEventHandler(async (event): Promise<UserInfo> => {
  const token = getCookie(event, 'auth_token');

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  try {
    const user = await $fetch<UserInfo>('https://accounts.betterseqta.org/api/oauth/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Ensure profile picture URLs use accounts.betterseqta.org
    if (user.pfpUrl) {
      // Replace betterseqta.org with accounts.betterseqta.org for pfp URLs
      user.pfpUrl = user.pfpUrl.replace(
        'https://betterseqta.org/pfp/',
        'https://accounts.betterseqta.org/pfp/'
      );
      // Also handle cases where it might already have /pfp/ but wrong domain
      if (user.pfpUrl.startsWith('/pfp/')) {
        user.pfpUrl = `https://accounts.betterseqta.org${user.pfpUrl}`;
      }
    }

    return user;
  } catch (e) {
    // Token might be invalid or expired
    deleteCookie(event, 'auth_token');
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid Token',
    });
  }
});

