import type { H3Event } from 'h3';

/** Extension-facing API host (remote config, theme packages, etc.). */
export function getPublicApiUrl(event?: H3Event | null): string {
  try {
    const config = useRuntimeConfig(event as H3Event);
    const fromConfig = String(config.public?.apiUrl ?? '').trim();
    if (fromConfig) {
      return fromConfig.replace(/\/$/, '');
    }
  } catch {
    // ignore — fall through to defaults
  }

  const cfEnv =
    (event as any)?.context?.cloudflare?.env ??
    (globalThis as any).__env__ ??
    null;

  const fromEnv = String(
    cfEnv?.NUXT_PUBLIC_API_URL ??
      process.env.NUXT_PUBLIC_API_URL ??
      process.env.PUBLIC_API_URL ??
      ''
  ).trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  return 'https://betterseqta.org';
}
