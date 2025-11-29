export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const code = query.code;

  if (!code) {
    return sendRedirect(event, '/?error=no_code');
  }

  try {
    // Exchange code for token
    const tokenResponse: any = await $fetch('https://accounts.betterseqta.org/api/oauth/token', {
      method: 'POST',
      body: {
        client_id: config.oauthClientId,
        client_secret: config.oauthClientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: config.oauthRedirectUri,
      }
    });

    if (tokenResponse.error) {
      console.error('OAuth Error:', tokenResponse.error);
      return sendRedirect(event, '/?error=oauth_failed');
    }

    const accessToken = tokenResponse.access_token;
    const expiresIn = tokenResponse.expires_in || 3600;

    // Set HTTP-only cookie
    setCookie(event, 'auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });

    return sendRedirect(event, '/');
  } catch (e) {
    console.error('OAuth Callback Error:', e);
    return sendRedirect(event, '/?error=server_error');
  }
});

