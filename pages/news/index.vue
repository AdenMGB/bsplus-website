<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-2xl lg:mx-0">
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">News & Updates</h2>
        <p class="mt-2 text-lg leading-8 text-zinc-300">Latest updates from the BetterSEQTA+ team.</p>
      </div>
      
      <div class="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-zinc-700 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        <article v-for="post in posts" :key="post.id" class="flex flex-col items-start justify-between bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:bg-zinc-800 transition-all hover:scale-[1.02] duration-300 h-[400px] overflow-hidden relative">
          <div class="flex items-center gap-x-4 text-xs z-10">
            <time :datetime="formatDate(post.created_at)" class="text-zinc-400">{{ formatDate(post.created_at) }}</time>
          </div>
          <div class="group relative flex-1 w-full overflow-hidden">
            <h3 class="mt-3 text-lg font-semibold leading-6 text-white group-hover:text-zinc-300">
              <NuxtLink :to="`/news/${post.slug}`">
                <span class="absolute inset-0 z-20"></span>
                {{ post.title }}
              </NuxtLink>
            </h3>
            <div class="mt-5 text-sm leading-6 text-zinc-400 prose prose-invert max-w-none" v-html="post.content"></div>
            
            <!-- Gradient Overlay -->
            <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent pointer-events-none z-10"></div>
          </div>
          <div class="relative mt-4 flex items-center gap-x-4 w-full pt-4 border-t border-zinc-800/50 z-10 bg-zinc-900">
            <img :src="post.author_avatar || `https://ui-avatars.com/api/?name=${post.author_name}`" alt="" class="h-10 w-10 rounded-full bg-zinc-800" />
            <div class="text-sm leading-6">
              <p class="font-semibold text-white">
                <span class="absolute inset-0"></span>
                {{ post.author_name }}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: posts } = await useFetch('/api/news');

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

useHead({
  title: "News",
});
</script>

