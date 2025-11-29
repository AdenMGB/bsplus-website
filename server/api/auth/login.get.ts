export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  const query = {
    client_id: config.oauthClientId,
    redirect_uri: config.oauthRedirectUri,
    response_type: 'code',
  };

  const url = `https://accounts.betterseqta.org/oauth/authorize?${new URLSearchParams(query as any).toString()}`;
  return sendRedirect(event, url);
});

