/**
 * Browser lifetime for the `auth_token` cookie (sliding window).
 * OAuth access tokens usually expire sooner; `/api/auth/refresh` renews the token and resets this cookie TTL.
 * If the user does not complete OAuth or refresh within this window, the cookie expires and they must sign in again.
 */
export const AUTH_TOKEN_COOKIE_MAX_AGE_SEC = 2 * 24 * 60 * 60;

/** Nitro/H3 `setCookie` options for storing the synced access token. */
export function getAuthTokenCookieSetOptions(): {
  httpOnly: boolean;
  secure: boolean;
  maxAge: number;
  path: string;
  sameSite: 'lax';
} {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: AUTH_TOKEN_COOKIE_MAX_AGE_SEC,
    path: '/',
    sameSite: 'lax',
  };
}
