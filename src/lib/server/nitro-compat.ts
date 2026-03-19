import { AsyncLocalStorage } from 'node:async_hooks';
import { error as svelteError, json, type RequestEvent } from '@sveltejs/kit';

type CompatModule = { default?: (event: CompatEvent) => unknown };

type CompatLoader = () => Promise<CompatModule>;

interface CompatRoute {
  key: string;
  method: string;
  segments: string[];
  loader: CompatLoader;
}

export interface CompatEvent {
  request: Request;
  url: URL;
  method: string;
  path: string;
  params: Record<string, string>;
  responseHeaders: Headers;
  context: {
    params: Record<string, string>;
    cloudflare: {
      env: App.Platform['env'] | undefined;
      cf: App.Platform['cf'] | undefined;
      ctx: App.Platform['ctx'] | undefined;
    };
  };
  req: {
    runtime: {
      cloudflare: {
        env: App.Platform['env'] | undefined;
      };
    };
  };
}

interface RequestStore {
  event: RequestEvent;
  compatEvent: CompatEvent;
  runtimeConfig: ReturnType<typeof createRuntimeConfig>;
}

const store = new AsyncLocalStorage<RequestStore>();

const modules = import.meta.glob('/server/api/**/*.ts') as Record<string, CompatLoader>;

const routes = Object.entries(modules)
  .map(([key, loader]) => createRoute(key, loader))
  .filter((route): route is CompatRoute => Boolean(route))
  .sort((a, b) => scoreRoute(b) - scoreRoute(a));

function createRoute(key: string, loader: CompatLoader): CompatRoute | null {
  const relative = key.replace('/server/api/', '').replace(/\.ts$/, '');
  const match = relative.match(/^(.*?)(?:\.(get|post|put|patch|delete|options|head))?$/i);
  if (!match) return null;

  const [, rawPath, rawMethod] = match;
  if (!rawMethod) return null;

  const segments = rawPath.split('/').filter(Boolean);
  if (segments.at(-1) === 'index') {
    segments.pop();
  }

  return {
    key,
    method: rawMethod.toUpperCase(),
    segments,
    loader
  };
}

function scoreRoute(route: CompatRoute) {
  return route.segments.reduce((score, segment) => {
    if (segment.startsWith('[...')) return score + 1;
    if (segment.startsWith('[')) return score + 2;
    return score + 4;
  }, 0);
}

function createRuntimeConfig(event: RequestEvent) {
  const env = event.platform?.env;
  const origin = event.url.origin || 'https://betterseqta.org';

  return {
    oauthClientId: env?.NUXT_OAUTH_CLIENT_ID ?? env?.OAUTH_CLIENT_ID ?? process.env.NUXT_OAUTH_CLIENT_ID ?? '',
    oauthClientSecret:
      env?.NUXT_OAUTH_CLIENT_SECRET ?? env?.OAUTH_CLIENT_SECRET ?? process.env.NUXT_OAUTH_CLIENT_SECRET ?? '',
    oauthRedirectUri:
      env?.NUXT_OAUTH_REDIRECT_URI ?? env?.OAUTH_REDIRECT_URI ?? process.env.NUXT_OAUTH_REDIRECT_URI ?? `${origin}/api/auth/callback`,
    accountsApiKey:
      env?.ACCOUNTS_API_KEY ?? env?.NUXT_ACCOUNTS_API_KEY ?? process.env.ACCOUNTS_API_KEY ?? process.env.NUXT_ACCOUNTS_API_KEY ?? '',
    accountsApiUrl:
      env?.ACCOUNTS_API_URL ?? env?.NUXT_ACCOUNTS_API_URL ?? process.env.ACCOUNTS_API_URL ?? process.env.NUXT_ACCOUNTS_API_URL ?? 'https://accounts.betterseqta.org',
    public: {
      siteUrl: env?.PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? 'https://betterseqta.org'
    }
  };
}

function parseCookies(cookieHeader: string | null) {
  const cookies = new Map<string, string>();
  if (!cookieHeader) return cookies;

  for (const part of cookieHeader.split(/;\s*/)) {
    const [name, ...valueParts] = part.split('=');
    if (!name) continue;
    cookies.set(name, decodeURIComponent(valueParts.join('=')));
  }

  return cookies;
}

function serializeCookie(name: string, value: string, options: Record<string, unknown> = {}) {
  const segments = [`${name}=${encodeURIComponent(value)}`];
  const path = options.path ?? '/';
  segments.push(`Path=${path}`);

  if (typeof options.maxAge === 'number') segments.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly) segments.push('HttpOnly');
  if (options.secure) segments.push('Secure');
  if (typeof options.sameSite === 'string') segments.push(`SameSite=${options.sameSite}`);
  if (typeof options.domain === 'string') segments.push(`Domain=${options.domain}`);
  if (options.expires instanceof Date) segments.push(`Expires=${options.expires.toUTCString()}`);

  return segments.join('; ');
}

function createCompatEvent(event: RequestEvent, params: Record<string, string>) {
  return {
    request: event.request,
    url: event.url,
    method: event.request.method,
    path: event.url.pathname,
    params,
    responseHeaders: new Headers(),
    context: {
      params,
      cloudflare: {
        env: event.platform?.env,
        cf: event.platform?.cf,
        ctx: event.platform?.ctx
      }
    },
    req: {
      runtime: {
        cloudflare: {
          env: event.platform?.env
        }
      }
    }
  } satisfies CompatEvent;
}

function mergeHeaders(result: Response, headers: Headers) {
  const merged = new Headers(result.headers);
  headers.forEach((value, key) => merged.append(key, value));
  return new Response(result.body, {
    status: result.status,
    statusText: result.statusText,
    headers: merged
  });
}

function toResponse(result: unknown, compatEvent: CompatEvent) {
  if (result instanceof Response) {
    return mergeHeaders(result, compatEvent.responseHeaders);
  }

  if (result === undefined || result === null) {
    return new Response(null, { headers: compatEvent.responseHeaders });
  }

  if (typeof result === 'string' || result instanceof ArrayBuffer || result instanceof Uint8Array) {
    const body =
      result instanceof Uint8Array
        ? new Uint8Array(result).buffer
        : result;

    return new Response(
      body,
      { headers: compatEvent.responseHeaders }
    );
  }

  const response = json(result);
  return mergeHeaders(response, compatEvent.responseHeaders);
}

function normalizeError(err: unknown): Response | Error {
  if (err instanceof Response) return err;
  if (err && typeof err === 'object' && 'statusCode' in err) {
    const status = Number((err as { statusCode?: number }).statusCode) || 500;
    const message =
      (err as { statusMessage?: string; message?: string }).statusMessage ??
      (err as { message?: string }).message ??
      'Internal Server Error';
    return new Error(`${status}:${message}`);
  }

  return err instanceof Error ? err : new Error('Internal Server Error');
}

function matchRoute(method: string, path: string) {
  const segments = path.replace(/^\/api\/?/, '').split('/').filter(Boolean);

  for (const route of routes) {
    if (route.method !== method) continue;

    const params: Record<string, string> = {};
    let matched = true;
    let index = 0;

    for (; index < route.segments.length; index += 1) {
      const routeSegment = route.segments[index];
      const pathSegment = segments[index];

      if (routeSegment?.startsWith('[...') && routeSegment.endsWith(']')) {
        params[routeSegment.slice(4, -1)] = segments.slice(index).join('/');
        index = segments.length;
        break;
      }

      if (!pathSegment) {
        matched = false;
        break;
      }

      if (routeSegment.startsWith('[') && routeSegment.endsWith(']')) {
        params[routeSegment.slice(1, -1)] = pathSegment;
        continue;
      }

      if (routeSegment !== pathSegment) {
        matched = false;
        break;
      }
    }

    if (!matched) continue;
    if (index < segments.length && !route.segments.at(-1)?.startsWith('[...')) continue;

    return { route, params };
  }

  return null;
}

async function compatFetch(input: string | Request, init?: RequestInit) {
  const current = store.getStore();
  if (!current) {
    return fetch(input, init);
  }

  const requestInfo = input instanceof Request ? input : new Request(input, init);
  const isRelative = typeof input === 'string' && input.startsWith('/');

  const requestInit: RequestInit = { ...init };
  const headers = new Headers(requestInit.headers ?? requestInfo.headers ?? {});
  const body = requestInit.body ?? (input instanceof Request ? input.body : undefined);

  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams) && !(body instanceof Blob) && !(body instanceof ArrayBuffer) && !(body instanceof Uint8Array) && !(body instanceof ReadableStream)) {
    headers.set('content-type', headers.get('content-type') ?? 'application/json');
    requestInit.body = JSON.stringify(body);
  } else if (body !== undefined) {
    requestInit.body = body as BodyInit;
  }

  requestInit.headers = headers;

  const response = isRelative
    ? await current.event.fetch(input, requestInit)
    : await fetch(input instanceof Request ? input : requestInfo, requestInit);

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  if (contentType.startsWith('text/')) {
    return response.text();
  }

  return response.arrayBuffer();
}

function installGlobals() {
  const g = globalThis as Record<string, unknown>;
  if (g.__nitroCompatInstalled) return;

  g.__nitroCompatInstalled = true;
  g.defineEventHandler = <T>(handler: T) => handler;
  g.defineSitemapEventHandler = <T>(handler: T) => handler;
  g.getQuery = (event: CompatEvent) => Object.fromEntries(event.url.searchParams.entries());
  g.getRouterParam = (event: CompatEvent, name: string) => event.params[name];
  g.getHeader = (event: CompatEvent, name: string) => event.request.headers.get(name) ?? undefined;
  g.getCookie = (event: CompatEvent, name: string) => parseCookies(event.request.headers.get('cookie')).get(name);
  g.setCookie = (event: CompatEvent, name: string, value: string, options?: Record<string, unknown>) => {
    event.responseHeaders.append('set-cookie', serializeCookie(name, value, options));
  };
  g.deleteCookie = (event: CompatEvent, name: string, options?: Record<string, unknown>) => {
    event.responseHeaders.append(
      'set-cookie',
      serializeCookie(name, '', {
        ...options,
        expires: new Date(0),
        maxAge: 0
      })
    );
  };
  g.setHeader = (event: CompatEvent, name: string, value: string) => {
    event.responseHeaders.set(name, value);
  };
  g.send = (event: CompatEvent, body: BodyInit | null, type = 'text/plain') => {
    event.responseHeaders.set('content-type', type);
    return new Response(body, { headers: event.responseHeaders });
  };
  g.sendStream = (event: CompatEvent, body: BodyInit | null) => new Response(body, { headers: event.responseHeaders });
  g.sendRedirect = (event: CompatEvent, location: string, status = 302) => {
    event.responseHeaders.set('location', location);
    return new Response(null, { status, headers: event.responseHeaders });
  };
  g.createError = (details: Record<string, unknown>) => Object.assign(new Error(String(details.statusMessage ?? details.message ?? 'Error')), details);
  g.readBody = async (event: CompatEvent) => {
    const contentType = event.request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return event.request.json();
    }
    const text = await event.request.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };
  g.readMultipartFormData = async (event: CompatEvent) => {
    const form = await event.request.formData();
    const parts = await Promise.all(
      Array.from(form.entries()).map(async ([name, value]) => {
        if (typeof value === 'string') {
          return {
            name,
            data: new TextEncoder().encode(value)
          };
        }

        return {
          name,
          filename: value.name,
          type: value.type,
          data: new Uint8Array(await value.arrayBuffer())
        };
      })
    );

    return parts;
  };
  g.useRuntimeConfig = () => {
    const current = store.getStore();
    return current?.runtimeConfig ?? createRuntimeConfig({ url: new URL('https://betterseqta.org') } as RequestEvent);
  };
  g.$fetch = compatFetch;
}

installGlobals();

export async function handleCompatApi(event: RequestEvent) {
  const match = matchRoute(event.request.method.toUpperCase(), event.url.pathname);
  if (!match) {
    throw svelteError(404, 'API route not found');
  }

  const module = await match.route.loader();
  if (!module.default) {
    throw svelteError(500, `API handler missing default export for ${match.route.key}`);
  }

  const compatEvent = createCompatEvent(event, match.params);

  try {
    const result = await store.run(
      {
        event,
        compatEvent,
        runtimeConfig: createRuntimeConfig(event)
      },
      async () => module.default!(compatEvent)
    );

    return toResponse(result, compatEvent);
  } catch (err) {
    const normalized = normalizeError(err);
    if (normalized instanceof Response) {
      return mergeHeaders(normalized, compatEvent.responseHeaders);
    }

    const [statusPart, ...messageParts] = normalized.message.split(':');
    const parsedStatus = Number(statusPart);
    if (!Number.isNaN(parsedStatus) && messageParts.length > 0) {
      throw svelteError(parsedStatus, messageParts.join(':'));
    }

    throw normalized;
  }
}
