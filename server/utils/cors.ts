import type { H3Event } from 'h3';
import { getHeader, getRequestURL, setResponseHeaders } from 'h3';

/** Methods exposed under /api (themes + admin + auth, etc.). */
export const API_ACCESS_CONTROL_ALLOW_METHODS =
  'GET, POST, PUT, PATCH, DELETE, OPTIONS';

export const API_ACCESS_CONTROL_ALLOW_HEADERS =
  'Authorization, Content-Type, Accept';

const API_ACCESS_CONTROL_MAX_AGE = '86400';

const ORIGIN_ECHO_PATTERN =
  /^https:\/\/(dev\.)?betterseqta\.org$|^moz-extension:\/\/.+|^chrome-extension:\/\/.+/;

/**
 * Resolves Access-Control-Allow-Origin. Uses `*` for Bearer-only clients.
 * Echoes the request Origin (with credentials) when it matches the site or
 * extension schemes, for callers that use cookies + credentials.
 */
export function resolveApiAccessControlAllowOrigin(event: H3Event): {
  allowOrigin: string;
  allowCredentials: boolean;
} {
  const origin = getHeader(event, 'origin');
  if (origin && ORIGIN_ECHO_PATTERN.test(origin)) {
    return { allowOrigin: origin, allowCredentials: true };
  }
  return { allowOrigin: '*', allowCredentials: false };
}

export function isApiRequestPath(event: H3Event): boolean {
  return getRequestURL(event).pathname.startsWith('/api');
}

/**
 * Sets CORS headers for /api responses. Use `preflight: true` for OPTIONS
 * so Access-Control-Max-Age is included (preflight cache).
 */
export function setApiCorsHeaders(
  event: H3Event,
  options: { preflight?: boolean } = {}
): void {
  const { allowOrigin, allowCredentials } =
    resolveApiAccessControlAllowOrigin(event);

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': API_ACCESS_CONTROL_ALLOW_METHODS,
    'Access-Control-Allow-Headers': API_ACCESS_CONTROL_ALLOW_HEADERS,
  };

  if (allowCredentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers.Vary = 'Origin';
  }

  if (options.preflight) {
    headers['Access-Control-Max-Age'] = API_ACCESS_CONTROL_MAX_AGE;
  }

  setResponseHeaders(event, headers);
}
