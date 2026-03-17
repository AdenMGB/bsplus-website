import type { H3Event } from 'h3';

/**
 * Get accounts API credentials from the request context.
 * Cloudflare-compatible: reads from event.context.cloudflare.env (Nitro v2)
 * or event.req.runtime.cloudflare.env (Nitro v3) at request time, since
 * secrets are only available during the request lifecycle on Cloudflare.
 * Falls back to useRuntimeConfig() for local dev / non-CF deployments.
 */
export function getAccountsApiCredentials(event: H3Event): {
  apiKey: string;
  url: string;
} {
  const cfEnv =
    (event as any).context?.cloudflare?.env ??
    (event as any).req?.runtime?.cloudflare?.env;

  const apiKey =
    cfEnv?.ACCOUNTS_API_KEY ??
    cfEnv?.NUXT_ACCOUNTS_API_KEY ??
    process.env.ACCOUNTS_API_KEY ??
    process.env.NUXT_ACCOUNTS_API_KEY ??
    (useRuntimeConfig().accountsApiKey as string) ??
    '';

  const url =
    cfEnv?.ACCOUNTS_API_URL ??
    cfEnv?.NUXT_ACCOUNTS_API_URL ??
    process.env.ACCOUNTS_API_URL ??
    process.env.NUXT_ACCOUNTS_API_URL ??
    (useRuntimeConfig().accountsApiUrl as string) ??
    'https://accounts.betterseqta.org';

  return {
    apiKey: String(apiKey || '').trim(),
    url: String(url || 'https://accounts.betterseqta.org').replace(/\/$/, ''),
  };
}
