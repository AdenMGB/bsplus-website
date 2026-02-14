<template>
  <div class="py-16 sm:py-24 lg:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display animate-slide-down">
          Changelogs
        </h1>
        <p class="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-zinc-300 animate-fade-in delay-100">
          Stay up to date with the latest releases and updates for BetterSEQTA+ and DesQTA.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- BetterSEQTA+ Latest Release -->
        <div class="relative flex">
          <div class="relative rounded-2xl bg-gradient-to-br from-zinc-800/50 via-zinc-900/50 to-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 p-8 sm:p-10 lg:p-12 shadow-xl hover:shadow-2xl transition-all duration-300 w-full flex flex-col">
            <div v-if="loadingBQPlus" class="flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400"></div>
            </div>
            <div v-else-if="bqplusRelease" class="flex flex-col h-full">
              <div class="flex-shrink-0">
                <span class="rounded-full bg-zinc-500/20 px-3 py-1 text-xs sm:text-sm font-semibold leading-6 text-zinc-300 ring-1 ring-inset ring-zinc-500/30">
                  Latest Release
                </span>
              </div>
              <h2 class="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-white font-display flex-shrink-0">
                BetterSEQTA+
              </h2>
              <div class="mt-2 flex items-center gap-2 flex-shrink-0">
                <span class="text-lg sm:text-xl font-medium text-zinc-300">{{ formatVersion(bqplusRelease.tag_name) }}</span>
                <span v-if="bqplusRelease.prerelease" class="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-300 ring-1 ring-inset ring-yellow-500/30">
                  Pre-release
                </span>
              </div>
              <time :datetime="bqplusRelease.published_at" class="mt-2 text-sm text-zinc-400 flex-shrink-0">
                {{ formatDate(bqplusRelease.published_at) }}
              </time>
              <div class="mt-6 prose prose-sm sm:prose-base prose-invert max-w-none text-zinc-300 flex-grow overflow-hidden">
                <div class="line-clamp-6" v-html="renderedBQPlusBody"></div>
              </div>
              <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 flex-shrink-0">
                <NuxtLink
                  :to="`/changelogs/bqplus`"
                  class="rounded-md bg-zinc-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600 transition-all duration-200"
                >
                  View All Releases
                </NuxtLink>
                <a
                  :href="bqplusRelease.html_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm font-semibold leading-6 text-zinc-400 transition-colors duration-200 hover:text-zinc-300"
                >
                  View on GitHub <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
            <div v-else class="text-center py-12 text-zinc-400">
              Failed to load release
            </div>
          </div>
        </div>

        <!-- DesQTA Latest Release -->
        <div class="relative flex">
          <div class="relative rounded-2xl bg-gradient-to-br from-zinc-800/50 via-zinc-900/50 to-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 p-8 sm:p-10 lg:p-12 shadow-xl hover:shadow-2xl transition-all duration-300 w-full flex flex-col overflow-hidden">
            <!-- Subtle blue blur hints -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            <div class="relative z-10 flex flex-col h-full">
              <div v-if="loadingDesQTA" class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
              <div v-else-if="desqtaRelease" class="flex flex-col h-full">
                <div class="flex-shrink-0">
                  <span class="rounded-full bg-blue-500/20 px-3 py-1 text-xs sm:text-sm font-semibold leading-6 text-blue-200 ring-1 ring-inset ring-blue-500/30">
                    Latest Release
                  </span>
                </div>
                <h2 class="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-white font-display flex-shrink-0">
                  DesQTA
                </h2>
                <div class="mt-2 flex items-center gap-2 flex-shrink-0">
                  <span class="text-lg sm:text-xl font-medium text-blue-300">{{ desqtaRelease.tag_name }}</span>
                  <span v-if="desqtaRelease.prerelease" class="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-300 ring-1 ring-inset ring-yellow-500/30">
                    Pre-release
                  </span>
                </div>
                <time :datetime="desqtaRelease.published_at" class="mt-2 text-sm text-zinc-400 flex-shrink-0">
                  {{ formatDate(desqtaRelease.published_at) }}
                </time>
                <div class="mt-6 prose prose-sm sm:prose-base prose-invert max-w-none text-zinc-300 flex-grow overflow-hidden">
                  <div class="line-clamp-6" v-html="renderedDesQTABody"></div>
                </div>
                <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 flex-shrink-0">
                  <NuxtLink
                    :to="`/changelogs/desqta`"
                    class="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200"
                  >
                    View All Releases
                  </NuxtLink>
                  <a
                    :href="desqtaRelease.html_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm font-semibold leading-6 text-zinc-400 transition-colors duration-200 hover:text-blue-300"
                  >
                    View on GitHub <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
              <div v-else class="text-center py-12 text-zinc-400">
                Failed to load release
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMarkdown } from '~/composables/useMarkdown';

usePageSeo({
  title: 'Changelogs - BetterSEQTA+ & DesQTA',
  description: 'Release notes and changelogs for BetterSEQTA+ browser extension and DesQTA desktop app. See what\'s new in each version.',
});

const { render } = useMarkdown();

const bqplusRelease = ref<any>(null);
const desqtaRelease = ref<any>(null);
const loadingBQPlus = ref(true);
const loadingDesQTA = ref(true);

const renderedBQPlusBody = computed(() => {
  if (!bqplusRelease.value?.body) return '';
  return render(bqplusRelease.value.body);
});

const renderedDesQTABody = computed(() => {
  if (!desqtaRelease.value?.body) return '';
  return render(desqtaRelease.value.body);
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

// Cache helpers
const getCachedRelease = (key: string): any | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error(`Error reading cache for ${key}:`, error);
  }
  return null;
};

const setCachedRelease = (key: string, release: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(release));
  } catch (error) {
    console.error(`Error caching ${key}:`, error);
  }
};

const fetchAndUpdateRelease = async (endpoint: string, cacheKey: string, releaseRef: any, loadingRef: any) => {
  try {
    // Fetch latest release (per_page=1 for speed)
    const response = await fetch(`${endpoint}?page=1&per_page=1`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const latestRelease = data[0];
        
        // Compare tag_name with cached release
        const cachedRelease = getCachedRelease(cacheKey);
        if (!cachedRelease || cachedRelease.tag_name !== latestRelease.tag_name) {
          // New release or no cache, update
          releaseRef.value = latestRelease;
          setCachedRelease(cacheKey, latestRelease);
        } else {
          // Same release, use cached version (already loaded)
          releaseRef.value = cachedRelease;
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching release from ${endpoint}:`, error);
    // Fallback to cache if fetch fails
    const cachedRelease = getCachedRelease(cacheKey);
    if (cachedRelease) {
      releaseRef.value = cachedRelease;
    }
  } finally {
    loadingRef.value = false;
  }
};

onMounted(async () => {
  // Load from cache immediately
  const cachedBQPlus = getCachedRelease('changelog_bqplus_latest');
  const cachedDesQTA = getCachedRelease('changelog_desqta_latest');
  
  if (cachedBQPlus) {
    bqplusRelease.value = cachedBQPlus;
    loadingBQPlus.value = false;
  }
  
  if (cachedDesQTA) {
    desqtaRelease.value = cachedDesQTA;
    loadingDesQTA.value = false;
  }
  
  // Check for updates in the background
  fetchAndUpdateRelease('/api/changelogs/bqplus', 'changelog_bqplus_latest', bqplusRelease, loadingBQPlus);
  fetchAndUpdateRelease('/api/changelogs/desqta', 'changelog_desqta_latest', desqtaRelease, loadingDesQTA);
});
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
}
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-24px); }
  to { opacity: 1; transform: none; }
}

.animate-fade-in {
  animation: fade-in 0.8s cubic-bezier(0.4,0,0.2,1) both;
}
.animate-slide-down {
  animation: slide-down 0.8s cubic-bezier(0.4,0,0.2,1) both;
}
.delay-100 { animation-delay: 0.1s; }
</style>
