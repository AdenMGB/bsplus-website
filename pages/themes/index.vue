<template>
  <div class="relative isolate overflow-hidden">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 pb-12 pt-8 sm:pt-10 lg:px-8 lg:pb-20 lg:pt-16">
      <div class="mx-auto max-w-3xl text-center">
        <p class="text-sm font-semibold leading-7 text-violet-400">SEQTA Learn &amp; DesQTA</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl font-display">
          Theme store
        </h1>
        <p class="mt-4 text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">
          Browse community themes for <strong class="font-semibold text-white">BetterSEQTA+</strong> (SEQTA Learn in the browser)
          and <strong class="font-semibold text-white">DesQTA</strong> (desktop and mobile). Customise SEQTA with dark mode, colour
          packs, and full UI skins.
        </p>
      </div>

      <!-- Featured -->
      <section
        v-if="featuredThemes.length > 0"
        class="mt-14 lg:mt-20"
        aria-labelledby="featured-heading"
      >
        <div class="flex items-end justify-between gap-4 px-1">
          <h2 id="featured-heading" class="text-lg font-semibold text-white sm:text-xl">
            Featured
          </h2>
        </div>
        <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            v-for="t in featuredThemes"
            :key="t.id"
            :to="`/themes/${encodeURIComponent(t.slug)}`"
            class="group relative overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/40 shadow-md backdrop-blur-sm transition-all duration-200 hover:border-violet-500/40 hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            <div class="aspect-[16/10] w-full overflow-hidden bg-zinc-800">
              <img
                v-if="cardImage(t)"
                :src="cardImage(t)!"
                :alt="`${t.name} theme preview for SEQTA`"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                width="640"
                height="400"
              />
              <div v-else class="flex h-full w-full items-center justify-center text-zinc-600">
                <span class="text-sm">No preview</span>
              </div>
            </div>
            <div class="p-4">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  :class="typeBadgeClass(t.theme_type)"
                  class="rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
                >
                  {{ typeLabel(t.theme_type) }}
                </span>
                <span v-if="t.featured" class="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-300 ring-1 ring-inset ring-amber-500/25">
                  Featured
                </span>
              </div>
              <h3 class="mt-2 text-base font-semibold text-white group-hover:text-violet-200 transition-colors duration-200">
                {{ t.name }}
              </h3>
              <p class="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-400">
                {{ t.description }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Filters -->
      <div class="mt-14 flex flex-col gap-4 lg:mt-20 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by app">
          <button
            v-for="opt in typeOptions"
            :key="opt.value"
            type="button"
            :class="[
              typeFilter === opt.value
                ? 'bg-violet-600 text-white ring-violet-500'
                : 'bg-zinc-800/80 text-zinc-300 ring-zinc-600 hover:bg-zinc-700/80 hover:text-white',
              'rounded-lg px-4 py-2 text-sm font-medium ring-1 ring-inset transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950',
            ]"
            @click="typeFilter = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
        <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          <label class="sr-only" for="theme-search">Search themes</label>
          <input
            id="theme-search"
            v-model="searchInput"
            type="search"
            placeholder="Search SEQTA themes…"
            class="w-full min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm text-white placeholder:text-zinc-500 transition-colors duration-200 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 sm:max-w-xs"
            autocomplete="off"
          />
          <label class="sr-only" for="theme-sort">Sort</label>
          <select
            id="theme-sort"
            v-model="sort"
            class="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm text-white transition-colors duration-200 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 sm:w-44"
          >
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="rating">Top rated</option>
            <option value="downloads">Most downloads</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>
      </div>

      <!-- Grid -->
      <div v-if="pending" class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 6" :key="n" class="h-72 animate-pulse rounded-2xl bg-zinc-800/60" />
      </div>
      <div v-else-if="themes.length === 0" class="mt-16 rounded-2xl border border-zinc-700/80 bg-zinc-900/30 p-12 text-center">
        <p class="text-lg font-medium text-white">No themes match your filters</p>
        <p class="mt-2 text-sm text-zinc-400">Try another search or show all themes.</p>
        <button
          type="button"
          class="mt-6 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 hover:scale-105 active:scale-95"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>
      <div v-else class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="t in themes"
          :key="t.id"
          :to="`/themes/${encodeURIComponent(t.slug)}`"
          class="group flex flex-col overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/40 shadow-md backdrop-blur-sm transition-all duration-200 hover:border-violet-500/35 hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          <div class="aspect-[16/10] w-full overflow-hidden bg-zinc-800">
            <img
              v-if="cardImage(t)"
              :src="cardImage(t)!"
              :alt="`${t.name} — ${typeLabel(t.theme_type)} theme for SEQTA`"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              width="640"
              height="400"
            />
            <div v-else class="flex h-full w-full items-center justify-center text-zinc-600">
              <span class="text-sm">No preview</span>
            </div>
          </div>
          <div class="flex flex-1 flex-col p-4">
            <div class="flex flex-wrap items-center gap-2">
              <span
                :class="typeBadgeClass(t.theme_type)"
                class="rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset"
              >
                {{ typeLabel(t.theme_type) }}
              </span>
              <span v-if="(t.rating_count ?? 0) > 0" class="flex items-center gap-1 text-xs text-zinc-400">
                <svg class="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {{ t.rating_average?.toFixed(1) ?? '0.0' }}
              </span>
            </div>
            <h3 class="mt-2 text-lg font-semibold text-white group-hover:text-violet-200 transition-colors duration-200">
              {{ t.name }}
            </h3>
            <p class="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-400">
              {{ t.description }}
            </p>
            <p class="mt-3 text-xs text-zinc-500">By {{ t.author }}</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <nav
        v-if="pagination.total_pages > 1"
        class="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
        aria-label="Theme list pagination"
      >
        <p class="text-sm text-zinc-400">
          Page {{ pagination.page }} of {{ pagination.total_pages }} · {{ pagination.total }} themes
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            :disabled="!pagination.has_prev"
            class="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-40 hover:scale-105 active:scale-95 disabled:hover:scale-100"
            @click="page = Math.max(1, page - 1)"
          >
            Previous
          </button>
          <button
            type="button"
            :disabled="!pagination.has_next"
            class="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-40 hover:scale-105 active:scale-95 disabled:hover:scale-100"
            @click="page = page + 1"
          >
            Next
          </button>
        </div>
      </nav>

      <section class="mt-20 rounded-2xl border border-zinc-700/60 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 p-8 sm:p-10" aria-labelledby="install-heading">
        <h2 id="install-heading" class="text-xl font-semibold text-white sm:text-2xl">
          How to install themes
        </h2>
        <ul class="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-zinc-300 sm:text-base">
          <li>
            <strong class="text-white">BetterSEQTA+</strong> — Install the extension from
            <NuxtLink to="/download" class="text-violet-400 underline-offset-2 hover:underline">Download</NuxtLink>,
            open SEQTA Learn, then add themes from the in-app theme store or import a theme JSON when offered.
          </li>
          <li>
            <strong class="text-white">DesQTA</strong> — Download the app from
            <NuxtLink to="/download" class="text-violet-400 underline-offset-2 hover:underline">Download</NuxtLink>,
            then apply DesQTA theme packages from this store inside the app.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ListedTheme {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  theme_type?: string;
  featured?: boolean;
  rating_average?: number;
  rating_count?: number;
  coverImage?: string;
  preview?: { thumbnail?: string | null };
}

const config = useRuntimeConfig();
const baseUrl = (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');

const page = ref(1);
const typeFilter = ref<'all' | 'betterseqta' | 'desqta'>('all');
const sort = ref('popular');
const searchInput = ref('');
const debouncedSearch = ref('');

let searchDebounce: ReturnType<typeof setTimeout> | null = null;
watch(searchInput, (v) => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    debouncedSearch.value = v.trim();
    page.value = 1;
  }, 300);
});

const typeOptions = [
  { value: 'all' as const, label: 'All themes' },
  { value: 'betterseqta' as const, label: 'BetterSEQTA+ (browser)' },
  { value: 'desqta' as const, label: 'DesQTA (desktop / app)' },
];

watch([typeFilter, sort], () => {
  page.value = 1;
});

const listQuery = computed(() => ({
  page: page.value,
  limit: 12,
  sort: sort.value,
  type: typeFilter.value === 'all' ? undefined : typeFilter.value,
  search: debouncedSearch.value || undefined,
}));

const { data: listData, pending } = await useFetch<{
  data?: {
    themes: ListedTheme[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}>('/api/themes', { query: listQuery });

const { data: featuredData } = await useFetch<{
  data?: { themes: ListedTheme[] };
}>('/api/themes', {
  query: { featured: 'true', limit: 8, sort: 'popular' },
});

const themes = computed(() => listData.value?.data?.themes ?? []);
const pagination = computed(
  () =>
    listData.value?.data?.pagination ?? {
      page: 1,
      limit: 12,
      total: 0,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    }
);

const featuredThemes = computed(() => {
  const all = featuredData.value?.data?.themes ?? [];
  if (typeFilter.value === 'all') return all;
  return all.filter((t) => t.theme_type === typeFilter.value);
});

function cardImage(t: ListedTheme): string | null {
  if (t.theme_type === 'betterseqta' && t.coverImage) return t.coverImage;
  return t.preview?.thumbnail || null;
}

function typeLabel(themeType?: string) {
  return themeType === 'betterseqta' ? 'BetterSEQTA+' : 'DesQTA';
}

function typeBadgeClass(themeType?: string) {
  return themeType === 'betterseqta'
    ? 'bg-violet-500/15 text-violet-200 ring-violet-500/25'
    : 'bg-sky-500/15 text-sky-200 ring-sky-500/25';
}

function clearFilters() {
  typeFilter.value = 'all';
  sort.value = 'popular';
  searchInput.value = '';
  debouncedSearch.value = '';
  page.value = 1;
}

const seoDescription =
  'Official BetterSEQTA theme store: SEQTA Learn and DesQTA themes, skins, and dark mode packs. Download BetterSEQTA+ browser themes and DesQTA desktop themes in one place.';

usePageSeo({
  title: 'Theme store',
  description: seoDescription,
  canonical: `${baseUrl}/themes`,
});

useHead({
  meta: [
    {
      name: 'keywords',
      content:
        'BetterSEQTA themes, SEQTA themes, SEQTA Learn themes, DesQTA themes, BetterSEQTA Plus, SEQTA skin, SEQTA dark mode, student portal themes, browser extension themes',
    },
  ],
});

const schemaHelpers = useSchemaOrgHelpers();
useSchemaOrg([
  schemaHelpers.webPage(
    'BetterSEQTA & DesQTA theme store',
    'Browse themes for SEQTA Learn (BetterSEQTA+) and DesQTA. Free community themes, skins, and UI packs.'
  ),
]);

const itemListJson = computed(() => {
  const items = themes.value;
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BetterSEQTA and DesQTA themes',
    description: seoDescription,
    numberOfItems: items.length,
    itemListElement: items.map((t, i) => ({
      '@type': 'ListItem',
      position: (pagination.value.page - 1) * pagination.value.limit + i + 1,
      url: `${baseUrl}/themes/${t.slug}`,
      name: t.name,
    })),
  };
});

useHead({
  script: computed(() => {
    const json = itemListJson.value;
    if (!json) return [];
    return [
      {
        key: 'theme-store-itemlist',
        type: 'application/ld+json',
        children: JSON.stringify(json),
      },
    ];
  }),
});
</script>
