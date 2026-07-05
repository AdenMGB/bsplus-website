const THEME_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isDesqtaThemeUuid(value: string | null | undefined): value is string {
  return typeof value === 'string' && THEME_UUID_RE.test(value.trim());
}

/** Resolve theme id from query params (id, theme_id, themeId). */
export function resolveDesqtaThemeIdFromQuery(
  query: Record<string, string | string[] | undefined> | null | undefined
): string | null {
  if (!query) return null;
  for (const key of ['id', 'theme_id', 'themeId'] as const) {
    const raw = query[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (isDesqtaThemeUuid(value)) return value.trim();
  }
  return null;
}

export function getDesqtaThemeInstallWebUrl(
  themeId: string,
  siteUrl = 'https://betterseqta.org'
): string {
  const base = siteUrl.replace(/\/$/, '');
  return `${base}/desqta/theme/install?id=${encodeURIComponent(themeId)}`;
}

export function getDesqtaThemeInstallSchemeUrl(themeId: string): string {
  return `desqta://theme/install?id=${encodeURIComponent(themeId)}`;
}

export const DESQTA_DOWNLOAD_FALLBACK_PATH = '/download';

/**
 * Try to open a theme in DesQTA via the registered desqta:// handler.
 * If the app does not take focus within timeoutMs, navigates to the download page.
 */
export function openDesqtaThemeInstall(
  themeId: string,
  options?: { fallbackPath?: string; timeoutMs?: number }
): void {
  if (typeof window === 'undefined') return;

  const schemeUrl = getDesqtaThemeInstallSchemeUrl(themeId);
  const fallbackPath = options?.fallbackPath ?? DESQTA_DOWNLOAD_FALLBACK_PATH;
  const timeoutMs = options?.timeoutMs ?? 2500;

  let cancelled = false;
  let fallbackTimer: ReturnType<typeof setTimeout>;

  const cancel = () => {
    if (cancelled) return;
    cancelled = true;
    window.clearTimeout(fallbackTimer);
    window.removeEventListener('blur', cancel);
    document.removeEventListener('visibilitychange', onHide);
    document.removeEventListener('pagehide', cancel);
  };

  const onHide = () => {
    if (document.hidden) cancel();
  };

  window.addEventListener('blur', cancel);
  document.addEventListener('visibilitychange', onHide);
  document.addEventListener('pagehide', cancel);

  fallbackTimer = window.setTimeout(() => {
    if (!cancelled) {
      cancel();
      window.location.assign(fallbackPath);
    }
  }, timeoutMs);

  const link = document.createElement('a');
  link.href = schemeUrl;
  link.referrerPolicy = 'no-referrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
