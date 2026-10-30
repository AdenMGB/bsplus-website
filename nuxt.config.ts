// https://nuxt.com/docs/api/configuration/nuxt-config

const isLocalDev =
  process.env.NODE_ENV === 'development' ||
  process.env.CF_DEV === '1' ||
  Boolean(
    process.env.DEV_ACCOUNTS_URL ||
      process.env.DEV_BSPLUS_URL ||
      process.env.DEV_MAIL_URL,
  );

const defaultAccountsUrl =
  isLocalDev && process.env.DEV_ACCOUNTS_URL
    ? process.env.DEV_ACCOUNTS_URL
    : (process.env.ACCOUNTS_API_URL ?? 'https://accounts.betterseqta.org');

const defaultMailUrl =
  isLocalDev && process.env.DEV_MAIL_URL
    ? process.env.DEV_MAIL_URL
    : (process.env.BS_MAIL_API_URL ?? 'https://mail.internal.betterseqta.org');

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  site: {
    url: "https://betterseqta.org/",
    name: "BetterSEQTA Plus - SEQTA Learn Enhanced",
  },
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  runtimeConfig: {
    oauthClientId: process.env.NUXT_OAUTH_CLIENT_ID ?? '',
    oauthClientSecret: process.env.NUXT_OAUTH_CLIENT_SECRET ?? '',
    oauthRedirectUri: process.env.NUXT_OAUTH_REDIRECT_URI ?? "http://localhost:8787/api/auth/callback",
    accountsApiKey: process.env.ACCOUNTS_API_KEY ?? '',
    accountsApiUrl: defaultAccountsUrl,
    /** Salt for hashing client IPs on feedback submissions (abuse limits only). */
    feedbackIpSalt: process.env.FEEDBACK_IP_SALT ?? 'bsplus-feedback-ip-salt-v1',
    /** PAT for BetterSEQTA/BS-Status mirror (Contents write). Prefer wrangler secret in production. */
    githubBsStatusToken: process.env.GITHUB_BS_STATUS_TOKEN ?? '',
    /** BetterSEQTA Mail API */
    bsMailApiKey: process.env.BS_MAIL_API_KEY ?? '',
    bsMailFrom: process.env.BS_MAIL_FROM ?? '',
    bsMailApiUrl: defaultMailUrl,
    public: {
      siteUrl:
        isLocalDev && process.env.DEV_BSPLUS_URL
          ? process.env.DEV_BSPLUS_URL.replace(/\/$/, '')
          : (process.env.NUXT_PUBLIC_SITE_URL ?? 'https://betterseqta.org'),
      apiUrl:
        isLocalDev && process.env.DEV_API_URL
          ? process.env.DEV_API_URL.replace(/\/$/, '')
          : (process.env.NUXT_PUBLIC_API_URL ?? 'https://api.betterseqta.org'),
    },
  },
  app: {
    baseURL: '/',
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'BetterSEQTA Plus - SEQTA Learn Enhanced',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'BetterSEQTA+ and DesQTA enhance SEQTA Learn with themes, live wallpapers, and a full desktop experience. Download for Windows, Mac, Linux, and Android.' },
        { name: 'theme-color', content: '#18181b' }
      ]
    }
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/fonts",
    "@nuxtjs/seo",
  ],
  css: ["~/assets/core.scss"],

    nitro: {
      preset: "cloudflare-module",
      minify: true,
      compressPublicAssets: true,
      experimental: {
        tasks: true,
      },
      // Must match wrangler.toml [triggers].crons
      scheduledTasks: {
        "0 2 * * *": ["daily-maintenance"],
        "*/30 * * * *": ["interop-sync"],
      },
      prerender: {
        crawlLinks: false, // DB binding unavailable at build time; render at runtime on CF Workers
      },
    },

  ogImage: {
    zeroRuntime: false,
    defaults: {
      width: 1200,
      height: 630,
    },
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'BetterSEQTA',
      url: 'https://betterseqta.org',
      logo: 'https://betterseqta.org/web-app-manifest-512x512.png',
    },
  },

  robots: {
    disallow: ['/admin', '/api'],
    allow: ['/'],
  },

  fonts: {
    families: [
      { name: "Inter", provider: "none" },
      { name: "Motiva Sans", provider: "none" },
    ],
  },

  typescript: {
    typeCheck: false,

    tsConfig: {
      compilerOptions: {
        verbatimModuleSyntax: false,
        strictNullChecks: true,
        skipLibCheck: true,
      },
    },
  },
});
