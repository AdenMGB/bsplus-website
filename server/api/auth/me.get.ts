export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token');

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  try {
    const user = await $fetch('https://accounts.betterseqta.org/api/oauth/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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

