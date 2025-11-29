<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-3xl">
        <div class="mb-8">
          <NuxtLink to="/news" class="text-sm font-semibold leading-6 text-zinc-400 hover:text-white">&larr; Back to News</NuxtLink>
        </div>
        
        <article v-if="post">
           <div class="flex items-center gap-x-4 text-xs mb-4">
            <time :datetime="formatDate(post.created_at)" class="text-zinc-400">{{ formatDate(post.created_at) }}</time>
          </div>
          <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-8">{{ post.title }}</h1>
          
          <div class="flex items-center gap-x-4 mb-8 border-b border-zinc-700 pb-8">
             <img :src="(post as any).author_avatar || `https://ui-avatars.com/api/?name=${(post as any).author_name}`" alt="" class="h-10 w-10 rounded-full bg-zinc-800" />
            <div class="text-sm leading-6">
              <p class="font-semibold text-white">{{ (post as any).author_name }}</p>
            </div>
          </div>

          <div class="prose prose-invert prose-lg max-w-none text-zinc-300" v-html="post.content"></div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { data: post } = await useFetch<any>(`/api/news/${route.params.slug}`);

if (!post.value) {
  throw createError({ statusCode: 404, message: 'Post not found' });
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

useHead({
  title: post.value?.title || 'News Post',
});
</script>

