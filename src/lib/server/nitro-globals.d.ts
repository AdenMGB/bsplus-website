declare global {
  function defineEventHandler<T>(handler: T): T;
  function defineSitemapEventHandler<T>(handler: T): T;
  function getQuery<T = Record<string, string | undefined>>(event: unknown): T;
  function getRouterParam(event: unknown, name: string): string | undefined;
  function getHeader(event: unknown, name: string): string | undefined;
  function getCookie(event: unknown, name: string): string | undefined;
  function setCookie(event: unknown, name: string, value: string, options?: Record<string, unknown>): void;
  function deleteCookie(event: unknown, name: string, options?: Record<string, unknown>): void;
  function setHeader(event: unknown, name: string, value: string): void;
  function send(event: unknown, body: BodyInit | null, type?: string): Response;
  function sendStream(event: unknown, body: BodyInit | null): Response;
  function sendRedirect(event: unknown, location: string, status?: number): Response;
  function createError(details: Record<string, unknown>): Error & {
    statusCode?: number;
    statusMessage?: string;
    message?: string;
    cause?: unknown;
  };
  function readBody<T = unknown>(event: unknown): Promise<T>;
  function readMultipartFormData(event: unknown): Promise<Array<{ name: string; filename?: string; type?: string; data: Uint8Array }>>;
  function useRuntimeConfig(): {
    oauthClientId: string;
    oauthClientSecret: string;
    oauthRedirectUri: string;
    accountsApiKey: string;
    accountsApiUrl: string;
    public: {
      siteUrl: string;
    };
  };
  const $fetch: <T = unknown>(
    input: string | Request,
    init?: RequestInit & { body?: unknown; query?: Record<string, string | number | boolean | undefined> }
  ) => Promise<T>;
}

export {};
