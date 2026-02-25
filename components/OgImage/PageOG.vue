<script lang="ts" setup>
/**
 * Generic OG image template for any page.
 * 1200x630 - standard OG dimensions.
 */
const {
  title: propTitle = 'BetterSEQTA Plus',
  description = 'SEQTA Learn Enhanced',
  headline = '',
} = defineProps<{
  title?: string;
  description?: string;
  headline?: string;
}>();

const title = computed(() => String(propTitle || 'BetterSEQTA Plus').slice(0, 60));
const desc = computed(() => String(description || 'SEQTA Learn Enhanced').slice(0, 160));

defineOgImageComponent('PageOG');
</script>

<template>
  <div class="flex h-full w-full flex-col justify-center bg-[#0f0f0f] p-16">
    <svg
      class="absolute inset-0 h-full w-full opacity-30"
      viewBox="0 0 1200 630"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="grad1" cx="0%" cy="0%" r="50%">
          <stop offset="0%" style="stop-color:#27272a" />
          <stop offset="100%" style="stop-color:#18181b" />
        </radialGradient>
        <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="80" />
        </filter>
      </defs>
      <rect width="1200" height="630" fill="url(#grad1)" />
      <circle cx="1000" cy="100" r="200" fill="#3b82f6" filter="url(#blur)" opacity="0.15" />
      <circle cx="200" cy="500" r="180" fill="#22c55e" filter="url(#blur)" opacity="0.1" />
    </svg>

    <div class="relative z-10 max-w-[800px]">
      <p
        v-if="headline"
        class="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400"
      >
        {{ headline }}
      </p>
      <h1 class="m-0 text-5xl font-bold leading-tight text-white">
        {{ title }}
      </h1>
      <p v-if="desc" class="mt-4 text-2xl leading-snug text-zinc-400">
        {{ desc }}
      </p>
      <div class="mt-8 flex items-center gap-3">
        <img src="/favicon-96x96.png" alt="" class="h-12 w-12 rounded-lg" />
        <span class="text-xl font-medium text-zinc-300">BetterSEQTA Plus</span>
      </div>
    </div>
  </div>
</template>
