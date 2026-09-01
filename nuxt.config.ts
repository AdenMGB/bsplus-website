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
    /** BetterSEQTA Mail API */
    bsMailApiKey: process.env.BS_MAIL_API_KEY ?? '',
    bsMailFrom: process.env.BS_MAIL_FROM ?? '',
    bsMailApiUrl: defaultMailUrl,
    public: {
      siteUrl:
        isLocalDev && process.env.DEV_BSPLUS_URL
          ? process.env.DEV_BSPLUS_URL.replace(/\/$/, '')
          : (process.env.NUXT_PUBLIC_SITE_URL ?? 'https://betterseqta.org'),
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
    "vue3-carousel-nuxt",
    "@nuxt/image",
    "@nuxt/fonts",
    "@nuxtjs/seo",
  ],
  css: ["~/assets/core.scss"],
  carousel: {
    prefix: "Vue",
  },

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
      logo: 'https://betterseqta.org/favicon-96x96.png',
    },
  },

  robots: {
    disallow: ['/admin', '/api'],
    allow: ['/'],
  },

  fonts: {
    families: [
      /*
      {
        name: "Helvetica",
        src: "/fonts/helvetica/helvetica-300-light.woff2",
      },
      {
        name: "Helvetica",
        src: "/fonts/helvetica/Helvetica-400-italic.woff",
      },
      {
        name: "Helvetica",
        src: "/fonts/helvetica/Helvetica-400.woff",
      },
      {
        name: "Helvetica",
        src: "/fonts/helvetica/Helvetica-600-bold-italic.woff",
      },
      {
        name: "Helvetica",
        src: "/fonts/helvetica/Helvetica-600-bold.woff",
      },
      */
      {
        name: "Inter",
        src: "/fonts/inter/Inter-variable-400.ttf",
      },
      {
        name: "Inter",
        src: "/fonts/inter/Inter-variable-400-italic.ttf",
      },
      /*
      {
        name: "Motiva Sans",
        src: "/fonts/motiva/motiva-sans-100-thin.ttf",
        weight: 100,
      },
      {
        name: "Motiva Sans",
        src: "/fonts/motiva/motiva-sans-300-light.woff.ttf",
        weight: 300,
      },
      {
        name: "Motiva Sans",
        src: "/fonts/motiva/motiva-sans-400-regular.woff.ttf",
        weight: 400,
      },
      {
        name: "Motiva Sans",
        src: "/fonts/motiva/motiva-sans-500-medium.woff.ttf",
        weight: 500
      },
      */
      {
        name: "Motiva Sans",
        src: "/fonts/motiva/motiva-sans-600-bold.woff.ttf",
        weight: 600,
      },
      /*
      {
        name: "Motiva Sans",
        src: "/fonts/motiva/motiva-sans-700-extra-bold.ttf",
        weight: 700
      },
      {
        name: "Motiva Sans",
        src: "/fonts/motiva/motiva-sans-900-black.woff.ttf",
        weight: 900
      },
      */
    ],
  },

  typescript: {
    typeCheck: false,

    tsConfig: {
      compilerOptions: {
        verbatimModuleSyntax: false,
        strictNullChecks: true,
        skipLibCheck: true,
        // exactOptionalPropertyTypes disabled - @nuxt/image types are incompatible
      },
    },
  },

  image: {
    quality: 80,
    format: ['webp']
  }
});
