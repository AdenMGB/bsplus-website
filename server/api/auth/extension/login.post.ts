import { getAccountsOAuthBaseUrl } from '../../../utils/accounts';
/**
 * Extension/DesQTA login: username + password → access token.
 * Proxies to accounts OAuth using resource owner password credentials grant.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event);

  if (!body?.username || !body?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'username and password are required'
    });
  }

  const config = useRuntimeConfig();

  try {
    const tokenResponse = await $fetch<{ access_token?: string; expires_in?: number; error?: string }>(
      `${getAccountsOAuthBaseUrl(event)}/api/oauth/token`,
      {
        method: 'POST',
        body: {
          grant_type: 'password',
          username: body.username,
          password: body.password,
          client_id: config.oauthClientId,
          client_secret: config.oauthClientSecret
        }
      }
    );

    if (tokenResponse.error || !tokenResponse.access_token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      });
    }

    return {
      access_token: tokenResponse.access_token,
      expires_in: tokenResponse.expires_in ?? 3600
    };
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'statusCode' in e) {
      throw e;
    }
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication failed'
    });
  }
});
