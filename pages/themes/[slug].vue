<template>
  <div class="relative isolate overflow-hidden">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 pb-16 pt-8 sm:pt-10 lg:px-8 lg:pb-24">
      <nav class="mb-8 text-sm" aria-label="Breadcrumb">
        <ol class="flex flex-wrap items-center gap-2 text-zinc-400">
          <li>
            <NuxtLink to="/themes" class="transition-colors duration-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded">
              Theme store
            </NuxtLink>
          </li>
          <li aria-hidden="true">/</li>
          <li class="font-medium text-white">{{ theme.name }}</li>
        </ol>
      </nav>

      <div class="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div class="lg:col-span-7">
          <div class="overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/40 shadow-lg">
            <div class="aspect-[16/9] w-full overflow-hidden bg-zinc-800">
              <img
                v-if="heroImage"
                :src="heroImage"
                :alt="`${theme.name} preview — ${productKindLabel} theme for SEQTA Learn`"
                class="h-full w-full object-cover"
                width="1200"
                height="675"
                fetchpriority="high"
              />
              <div v-else class="flex h-full min-h-[200px] items-center justify-center text-zinc-600">
                No banner image
              </div>
            </div>
            <div
              v-if="theme.theme_type === 'betterseqta' && marqueeImage"
              class="border-t border-zinc-700/80 bg-zinc-950/50 p-4"
            >
              <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">Marquee</p>
              <div class="mt-2 overflow-hidden rounded-lg border border-zinc-700/60">
                <img
                  :src="marqueeImage"
                  :alt="`${theme.name} marquee artwork`"
                  class="h-auto max-h-48 w-full object-cover object-center sm:max-h-56"
                  loading="lazy"
                  width="800"
                  height="200"
                />
              </div>
            </div>
          </div>

          <section class="mt-10" aria-labelledby="about-heading">
            <h2 id="about-heading" class="text-lg font-semibold text-white sm:text-xl">
              About this theme
            </h2>
            <p class="mt-3 whitespace-pre-wrap text-base leading-relaxed text-zinc-300">
              {{ theme.description }}
            </p>
            <ul
              v-if="theme.tags?.length"
              class="mt-6 flex flex-wrap gap-2"
              aria-label="Theme tags"
            >
              <li
                v-for="tag in theme.tags"
                :key="tag"
                class="rounded-lg bg-zinc-800/80 px-3 py-1 text-xs font-medium text-zinc-300 ring-1 ring-inset ring-zinc-600/80"
              >
                {{ tag }}
              </li>
            </ul>
          </section>
        </div>

        <aside class="lg:col-span-5">
          <div class="sticky top-6 rounded-2xl border border-zinc-700/80 bg-zinc-900/50 p-6 shadow-md backdrop-blur-sm sm:p-8">
            <div class="flex flex-wrap items-center gap-2">
              <span
                :class="theme.theme_type === 'betterseqta' ? 'bg-violet-500/15 text-violet-200 ring-violet-500/25' : 'bg-sky-500/15 text-sky-200 ring-sky-500/25'"
                class="rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
              >
                {{ productKindLabel }}
              </span>
              <span v-if="theme.featured" class="rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-200 ring-1 ring-inset ring-amber-500/25">
                Featured
              </span>
            </div>
            <h1 class="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl font-display">
              {{ theme.name }}
            </h1>
            <p class="mt-2 text-sm text-zinc-400">
              By {{ theme.author }}
              <span v-if="theme.version" class="text-zinc-500"> · v{{ theme.version }}</span>
            </p>
            <div v-if="(theme.rating_count ?? 0) > 0" class="mt-3 flex items-center gap-2 text-sm text-zinc-300">
              <span class="flex items-center gap-1 text-amber-400" aria-hidden="true">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {{ theme.rating_average?.toFixed(1) ?? '0.0' }}
              </span>
              <span class="text-zinc-500">({{ theme.rating_count }} ratings)</span>
            </div>

            <dl class="mt-6 space-y-3 border-t border-zinc-700/60 pt-6 text-sm">
              <div v-if="theme.category" class="flex justify-between gap-4">
                <dt class="text-zinc-500">Category</dt>
                <dd class="text-right font-medium text-white">{{ theme.category }}</dd>
              </div>
              <div v-if="theme.theme_type === 'desqta' && theme.compatibility?.min" class="flex justify-between gap-4">
                <dt class="text-zinc-500">DesQTA compatibility</dt>
                <dd class="text-right font-medium text-white">
                  {{ theme.compatibility.min }}+
                  <template v-if="theme.compatibility.max"> — {{ theme.compatibility.max }}</template>
                </dd>
              </div>
              <div v-if="theme.license" class="flex justify-between gap-4">
                <dt class="text-zinc-500">License</dt>
                <dd class="text-right font-medium text-white">{{ theme.license }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-zinc-500">Downloads</dt>
                <dd class="text-right font-medium text-white">{{ theme.download_count ?? 0 }}</dd>
              </div>
            </dl>

            <p class="mt-6 text-sm leading-relaxed text-zinc-400">
              <template v-if="theme.theme_type === 'betterseqta'">
                Install <NuxtLink to="/download" class="text-violet-400 underline-offset-2 hover:underline">BetterSEQTA+</NuxtLink>,
                open SEQTA Learn, then import this theme or subscribe via the extension theme store.
              </template>
              <template v-else>
                Install <NuxtLink to="/download" class="text-sky-400 underline-offset-2 hover:underline">DesQTA</NuxtLink>
                and apply this theme package from the app settings.
              </template>
            </p>

            <button
              type="button"
              :disabled="downloading"
              class="mt-6 w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98]"
              @click="startDownload"
            >
              {{ downloading ? 'Preparing…' : downloadCtaLabel }}
            </button>
            <p v-if="downloadError" class="mt-3 text-sm text-red-400" role="alert">
              {{ downloadError }}
            </p>

            <NuxtLink
              to="/themes"
              class="mt-4 block w-full rounded-lg border border-zinc-600 bg-transparent px-4 py-2.5 text-center text-sm font-semibold text-zinc-200 transition-all duration-200 hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              Browse all themes
            </NuxtLink>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PublicTheme {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  version?: string;
  license?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  theme_type?: string;
  download_count?: number;
  rating_average?: number;
  rating_count?: number;
  compatibility?: { min?: string; max?: string };
  preview?: { thumbnail?: string | null };
  coverImage?: string;
  marqueeImage?: string;
  theme_json_url?: string;
  zip_download_url?: string;
}

const route = useRoute();
const slug = route.params.slug as string;
const config = useRuntimeConfig();
const baseUrl = (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');

const { data: res } = await useFetch<{ data?: { theme: PublicTheme } }>(
  `/api/themes/by-slug/${encodeURIComponent(slug)}`
);

const themeRow = res.value?.data?.theme;
if (!themeRow) {
  throw createError({ statusCode: 404, statusMessage: 'Theme not found' });
}

const theme: PublicTheme = themeRow;
const themeId = theme.id;
const isBetterseqtaTheme = theme.theme_type === 'betterseqta';

const productKindLabel = isBetterseqtaTheme ? 'BetterSEQTA+ · SEQTA Learn' : 'DesQTA';

const heroImage =
  theme.theme_type === 'betterseqta' && theme.coverImage
    ? theme.coverImage
    : theme.preview?.thumbnail || theme.coverImage || '';

const marqueeImage = theme.theme_type === 'betterseqta' ? theme.marqueeImage || '' : '';

function truncateMeta(text: string, max: number) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

const typeSeoFragment = isBetterseqtaTheme
  ? 'BetterSEQTA+ browser extension theme for SEQTA Learn.'
  : 'DesQTA desktop app theme for SEQTA Learn.';

const seoDescription = `${truncateMeta(theme.description, 120)} ${typeSeoFragment}`;

const canonical = `${baseUrl}/themes/${theme.slug}`;
const ogImage =
  heroImage && heroImage.startsWith('http')
    ? heroImage
    : heroImage
      ? `${baseUrl}${heroImage.startsWith('/') ? '' : '/'}${heroImage}`
      : `${baseUrl}/favicon-96x96.png`;

usePageSeo({
  title: `${theme.name} — SEQTA theme`,
  description: seoDescription,
  canonical,
  image: ogImage,
  imageAlt: `${theme.name} theme preview for SEQTA Learn`,
});

useHead({
  meta: [
    {
      name: 'keywords',
      content: [
        theme.name,
        'SEQTA theme',
        'SEQTA Learn',
        isBetterseqtaTheme ? 'BetterSEQTA theme' : 'DesQTA theme',
        'BetterSEQTA Plus',
        'student portal theme',
      ].join(', '),
    },
  ],
});

const schemaHelpers = useSchemaOrgHelpers();
useSchemaOrg([
  schemaHelpers.webPage(`${theme.name} — ${productKindLabel} theme`, seoDescription),
]);

const productJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: theme.name,
  description: seoDescription,
  image: ogImage,
  brand: {
    '@type': 'Brand',
    name: 'BetterSEQTA',
  },
  category: isBetterseqtaTheme
    ? 'SEQTA Learn browser theme (BetterSEQTA+)'
    : 'DesQTA desktop theme',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'AUD',
    availability: 'https://schema.org/InStock',
    url: canonical,
  },
}));

const breadcrumbJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Theme store', item: `${baseUrl}/themes` },
    { '@type': 'ListItem', position: 2, name: theme.name, item: canonical },
  ],
}));

useHead({
  script: computed(() => [
    {
      key: `theme-product-${themeId}`,
      type: 'application/ld+json',
      children: JSON.stringify(productJsonLd.value),
    },
    {
      key: `theme-breadcrumb-${themeId}`,
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbJsonLd.value),
    },
  ]),
});

const downloading = ref(false);
const downloadError = ref('');

const downloadCtaLabel = isBetterseqtaTheme
  ? 'Get theme (SEQTA Learn)'
  : 'Download theme package';

async function startDownload() {
  downloadError.value = '';
  downloading.value = true;
  try {
    const r = await $fetch<{
      data: { zip_download_url?: string; theme_json_url?: string };
    }>(`/api/themes/${themeId}/download`);
    const url = r.data.zip_download_url || r.data.theme_json_url;
    if (!url) {
      downloadError.value = 'Download link unavailable.';
      return;
    }
    if (isBetterseqtaTheme) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url.startsWith('http') ? url : url;
    }
  } catch {
    downloadError.value = 'Could not start download. Try again later.';
  } finally {
    downloading.value = false;
  }
}
</script>
