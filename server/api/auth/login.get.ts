export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  // Use localhost for local dev, or get from env
  const redirectUri = process.env.NUXT_OAUTH_REDIRECT_URI || 'http://localhost:8787/api/auth/callback';
  
  const query = {
    client_id: config.oauthClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
  };

  // Explicitly construct the absolute URL to prevent any domain rewriting
  const baseUrl = 'https://accounts.betterseqta.org/oauth/authorize';
  const queryString = new URLSearchParams(query as any).toString();
  const finalUrl = `${baseUrl}?${queryString}`;
  
  console.log('[Auth] Redirecting to:', finalUrl);

  return new Response(null, {
    status: 302,
    headers: {
      'Location': finalUrl,
    },
  });
});

