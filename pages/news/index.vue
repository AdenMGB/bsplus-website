<template>
  <div class="py-16 sm:py-24 lg:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl lg:mx-0 px-4 sm:px-0">
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">News & Updates</h2>
        <p class="mt-2 text-base sm:text-lg leading-7 sm:leading-8 text-zinc-300">Latest updates from the BetterSEQTA+ team.</p>
      </div>
      
      <div class="mx-auto mt-8 sm:mt-10 grid max-w-2xl grid-cols-1 gap-x-6 sm:gap-x-8 gap-y-12 sm:gap-y-16 border-t border-zinc-700 pt-8 sm:pt-10 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:pt-16">
        <article v-for="post in posts" :key="post.id" class="flex flex-col items-start justify-between bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all hover:scale-[1.02] duration-300 overflow-hidden relative group min-h-[350px] sm:h-[400px]">
          <!-- Cover Image Background -->
          <div v-if="post.cover_image" class="absolute inset-0 z-0">
             <img :src="post.cover_image" :alt="post.title" class="w-full h-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-110" />
             <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/90 to-transparent"></div>
          </div>

          <div class="p-4 sm:p-6 flex flex-col h-full w-full relative z-10">
            <div class="flex items-center gap-x-4 text-xs mb-3 sm:mb-4">
              <time :datetime="formatDate(post.created_at)" class="text-zinc-400">{{ formatDate(post.created_at) }}</time>
            </div>
            
            <div class="flex-1 w-full overflow-hidden">
              <h3 class="text-base sm:text-lg font-semibold leading-6 text-white group-hover:text-green-400 transition-colors">
                <NuxtLink :to="`/news/${post.slug}`">
                  <span class="absolute inset-0"></span>
                  {{ post.title }}
                </NuxtLink>
              </h3>
              <!-- Strip HTML tags for preview and clamp -->
              <div class="mt-3 sm:mt-4 text-sm leading-6 text-zinc-400 line-clamp-4" v-html="post.content"></div>
            </div>
            
            <div class="relative mt-3 sm:mt-4 flex items-center gap-x-3 sm:gap-x-4 w-full pt-3 sm:pt-4 border-t border-zinc-800/50 z-10">
              <img :src="post.author_avatar || `https://ui-avatars.com/api/?name=${post.author_name}`" alt="" class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-zinc-800 ring-2 ring-zinc-800" />
              <div class="text-xs sm:text-sm leading-6">
                <p class="font-semibold text-white">
                  {{ post.author_name }}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const { data: posts, refresh } = await useFetch('/api/news');

// Fetch again with a slight delay to ensure data loads on direct navigation
onMounted(() => {
  setTimeout(() => {
    refresh();
  }, 100);
});

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

usePageSeo({
  title: "News",
  description: "Latest news and updates from the BetterSEQTA+ team. Stay informed about new features, releases, and SEQTA Learn enhancements.",
  ogImageComponent: "PageOG",
  ogImageProps: {
    title: "News & Updates",
    description: "Latest from BetterSEQTA+ — features, releases, SEQTA Learn",
    headline: "BetterSEQTA Plus",
  },
});
</script>

