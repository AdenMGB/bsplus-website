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

export const DESQTA_INSTALL_FALLBACK_PATH = '/download';

export type OpenDesqtaThemeInstallOptions = {
  fallbackPath?: string;
  /** Wait before assuming DesQTA did not open. */
  timeoutMs?: number;
};

/**
 * Try to open DesQTA via custom URL scheme in the same tab/window.
 * If the app does not appear to take focus, navigate to the download page.
 */
export function openDesqtaThemeInstall(
  themeId: string,
  options: OpenDesqtaThemeInstallOptions = {}
): void {
  if (typeof window === 'undefined' || !isDesqtaThemeUuid(themeId)) return;

  const { fallbackPath = DESQTA_INSTALL_FALLBACK_PATH, timeoutMs = 2500 } = options;
  const schemeUrl = getDesqtaThemeInstallSchemeUrl(themeId);

  let appOpened = false;
  const markOpened = () => {
    appOpened = true;
  };
  const onVisibilityChange = () => {
    if (document.hidden) markOpened();
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('blur', markOpened);
  window.addEventListener('pagehide', markOpened);

  window.location.assign(schemeUrl);

  window.setTimeout(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('blur', markOpened);
    window.removeEventListener('pagehide', markOpened);
    if (!appOpened) {
      window.location.assign(fallbackPath);
    }
  }, timeoutMs);
}
