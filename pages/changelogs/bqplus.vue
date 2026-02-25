<template>
  <div class="py-16 sm:py-24 lg:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mb-6 sm:mb-8">
        <NuxtLink to="/changelogs" class="text-sm font-semibold leading-6 text-zinc-400 hover:text-white">&larr; Back to Changelogs</NuxtLink>
      </div>

      <div class="mx-auto max-w-4xl">
        <div class="mb-8 sm:mb-12">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display">
            BetterSEQTA+ Changelog
          </h1>
          <p class="mt-4 text-base sm:text-lg leading-7 sm:leading-8 text-zinc-300">
            Complete release history and updates for BetterSEQTA+.
          </p>
        </div>

        <div v-if="loading && releases.length === 0" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400"></div>
        </div>

        <div v-else-if="releases.length === 0" class="text-center py-12 text-zinc-400">
          No releases found.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(release, index) in releases"
            :key="release.id"
            class="rounded-2xl bg-gradient-to-br from-zinc-800/50 via-zinc-900/50 to-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl"
          >
            <button
              @click="toggleRelease(release.id)"
              class="flex w-full items-center justify-between p-6 sm:p-8 text-left focus:outline-none focus-visible:ring focus-visible:ring-zinc-500 focus-visible:ring-opacity-75"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap">
                  <h3 class="text-lg sm:text-xl font-semibold text-white">
                    {{ release.name || formatVersion(release.tag_name) }}
                  </h3>
                  <span v-if="release.prerelease" class="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-300 ring-1 ring-inset ring-yellow-500/30">
                    Pre-release
                  </span>
                  <span v-if="release.draft" class="rounded-full bg-zinc-500/20 px-2 py-0.5 text-xs font-semibold text-zinc-300 ring-1 ring-inset ring-zinc-500/30">
                    Draft
                  </span>
                </div>
                <div class="mt-2 flex items-center gap-4 text-sm text-zinc-400">
                  <span>{{ formatVersion(release.tag_name) }}</span>
                  <span>•</span>
                  <time :datetime="release.published_at">{{ formatDate(release.published_at) }}</time>
                  <span>•</span>
                  <span>by {{ release.author }}</span>
                </div>
              </div>
              <ChevronUpIcon
                :class="[
                  'h-5 w-5 text-zinc-400 transition-transform duration-200 flex-shrink-0 ml-4',
                  expandedReleases.has(release.id) ? 'rotate-180' : ''
                ]"
              />
            </button>

            <div
              v-show="expandedReleases.has(release.id)"
              class="px-6 sm:px-8 pb-6 sm:pb-8 transition-all duration-200"
            >
              <div class="pt-4 border-t border-zinc-700/50">
                <div
                  class="prose prose-sm sm:prose-base prose-invert max-w-none text-zinc-300"
                  v-html="renderedBodies[release.id]"
                ></div>
                <div class="mt-6">
                  <a
                    :href="release.html_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center text-sm font-semibold text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    View on GitHub
                    <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading indicator for infinite scroll -->
        <div v-if="loadingMore" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-400"></div>
        </div>

        <!-- Intersection observer target -->
        <div ref="loadMoreTrigger" class="h-4"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { ChevronUpIcon } from '@heroicons/vue/24/outline';
import { useMarkdown } from '~/composables/useMarkdown';

usePageSeo({
  title: 'BetterSEQTA+ Changelog',
  description: 'Complete release history and updates for BetterSEQTA+ browser extension. See new features, themes, and SEQTA Learn enhancements.',
});

const { render } = useMarkdown();

const releases = ref<any[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const currentPage = ref(1);
const hasMore = ref(true);
const loadMoreTrigger = ref<HTMLElement | null>(null);
const expandedReleases = ref<Set<number>>(new Set());

const renderedBodies = computed(() => {
  const bodies: Record<number, string> = {};
  releases.value.forEach(release => {
    if (release.body) {
      bodies[release.id] = render(release.body);
    }
  });
  return bodies;
});

const formatVersion = (tag: string) => {
  if (!tag) return '';
  return tag.replace('betterseqtaplus@', 'v');
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const toggleRelease = (id: number) => {
  if (expandedReleases.value.has(id)) {
    expandedReleases.value.delete(id);
  } else {
    expandedReleases.value.add(id);
  }
};

const loadReleases = async (page: number, append = false) => {
  try {
    if (append) {
      loadingMore.value = true;
    } else {
      loading.value = true;
    }

    const response = await fetch(`/api/changelogs/bqplus?page=${page}&per_page=10`);
    if (!response.ok) {
      throw new Error(`Failed to fetch releases: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (append) {
      releases.value.push(...data);
    } else {
      releases.value = data;
      // Expand first release by default
      if (data.length > 0) {
        expandedReleases.value = new Set([data[0].id]);
      }
    }

    // Check if there are more releases
    hasMore.value = data.length === 10;
  } catch (error) {
    console.error('Error loading releases:', error);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    currentPage.value++;
    loadReleases(currentPage.value, true);
  }
};

let observer: IntersectionObserver | null = null;

onMounted(async () => {
  await loadReleases(1);

  // Set up intersection observer for infinite scroll
  if (loadMoreTrigger.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore.value && !loadingMore.value) {
          loadMore();
        }
      },
      {
        rootMargin: '100px'
      }
    );
    observer.observe(loadMoreTrigger.value as unknown as Element);
  }
});

onUnmounted(() => {
  if (observer && loadMoreTrigger.value) {
    observer.unobserve(loadMoreTrigger.value as unknown as Element);
    observer.disconnect();
  }
});

// Watch for changes to loadMoreTrigger ref
watch(loadMoreTrigger, (newVal) => {
  if (newVal && observer) {
    observer.observe(newVal as unknown as Element);
  }
});
</script>
