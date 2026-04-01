import { getAccountsApiCredentials } from '../../utils/accounts';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const { url } = getAccountsApiCredentials(event);
  const redirectUri = process.env.NUXT_OAUTH_REDIRECT_URI || 'http://localhost:8787/api/auth/callback';

  const query = {
    client_id: config.oauthClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
  };

  const queryString = new URLSearchParams(query as any).toString();
  const finalUrl = `${url}/oauth/authorize?${queryString}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: finalUrl,
    },
  });
});
