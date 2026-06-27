/**
 * Browser lifetime for auth cookies (sliding window on refresh).
 */
export const AUTH_TOKEN_COOKIE_MAX_AGE_SEC = 2 * 24 * 60 * 60;
export const AUTH_REFRESH_COOKIE_MAX_AGE_SEC = 180 * 24 * 60 * 60;

export const AUTH_TOKEN_COOKIE_NAME = 'auth_token';
export const AUTH_REFRESH_COOKIE_NAME = 'bs_refresh_token';
export const AUTH_REDIRECT_COOKIE_NAME = 'auth_redirect';

type CookieSetOptions = {
  httpOnly: boolean;
  secure: boolean;
  maxAge: number;
  path: string;
  sameSite: 'lax';
};

/** Nitro/H3 `setCookie` options for the synced access token (HttpOnly). */
export function getAuthTokenCookieSetOptions(): CookieSetOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: AUTH_TOKEN_COOKIE_MAX_AGE_SEC,
    path: '/',
    sameSite: 'lax',
  };
}

/** HttpOnly refresh token cookie for OAuth-backed website sessions. */
export function getAuthRefreshCookieSetOptions(): CookieSetOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: AUTH_REFRESH_COOKIE_MAX_AGE_SEC,
    path: '/',
    sameSite: 'lax',
  };
}

/** Short-lived cookie storing post-login redirect path. */
export function getAuthRedirectCookieSetOptions(): CookieSetOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
    path: '/',
    sameSite: 'lax',
  };
}

/**
 * Validate a post-login redirect path (same-origin relative paths only).
 */
export function sanitizeAuthRedirectPath(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return '/';
  const path = raw.trim();
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return '/';
  const lower = path.toLowerCase();
  if (lower.startsWith('/http:') || lower.startsWith('/https:')) return '/';
  try {
    const decoded = decodeURIComponent(path);
    if (decoded.startsWith('//') || decoded.includes('://')) return '/';
  } catch {
    return '/';
  }
  return path;
}

/** Parse auth_token value from a raw Cookie header (SSR). */
export function parseAuthTokenFromCookieHeader(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${AUTH_TOKEN_COOKIE_NAME}=`)) {
      const value = trimmed.slice(AUTH_TOKEN_COOKIE_NAME.length + 1);
      try {
        return decodeURIComponent(value) || null;
      } catch {
        return value || null;
      }
    }
  }
  return null;
}

/** Returns true if a JWT payload's exp claim is in the past (with 30s buffer). */
export function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof payload.exp !== 'number') return false;
    return payload.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
}
