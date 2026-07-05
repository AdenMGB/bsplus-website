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
