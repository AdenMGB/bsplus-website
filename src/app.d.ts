/// <reference types="@cloudflare/workers-types" />

declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
    }

    interface Locals {
      user: import('$lib/server/auth').UserInfo | null;
    }

    interface Platform {
      env: Env;
      cf: IncomingRequestCfProperties;
      ctx: ExecutionContext;
    }

    interface PageData {
      seo?: import('$lib/seo/types').SeoData;
      user?: import('$lib/server/auth').UserInfo | null;
      theme?: import('$lib/stores/theme').ThemeState;
    }
  }
}

export {};
