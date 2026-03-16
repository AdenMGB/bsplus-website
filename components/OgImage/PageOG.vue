<script lang="ts" setup>
/**
 * Generic OG image template for any page.
 * 1200x630 - standard OG dimensions.
 * Full bleed, site-themed, with logo.
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
  <div
    class="relative flex flex-col justify-between overflow-hidden p-16"
    style="width: 1200px; height: 630px; background-color: #09090b;"
  >
    <!-- Full-bleed background - explicit 1200x630 -->
    <svg
      viewBox="0 0 1200 630"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style="position: absolute; left: 0; top: 0; width: 1200px; height: 630px;"
    >
      <defs>
        <radialGradient id="pageog-grad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" style="stop-color:#18181b" />
          <stop offset="100%" style="stop-color:#09090b" />
        </radialGradient>
        <filter id="pageog-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="100" />
        </filter>
      </defs>
      <rect x="0" y="0" width="1200" height="630" fill="url(#pageog-grad)" />
      <circle cx="1100" cy="80" r="220" fill="#10b981" filter="url(#pageog-blur)" opacity="0.12" />
      <circle cx="100" cy="550" r="200" fill="#3b82f6" filter="url(#pageog-blur)" opacity="0.08" />
      <circle cx="600" cy="315" r="150" fill="#27272a" filter="url(#pageog-blur)" opacity="0.2" />
    </svg>

    <div class="relative z-10 flex flex-1 flex-col justify-center">
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
    </div>

    <!-- Bottom bar with logo and site name -->
    <div class="relative z-10 mt-8 flex items-center gap-4">
      <!-- Logo: inline SVG (always renders, no fetch needed) -->
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
        <rect width="48" height="48" rx="8" fill="url(#pageog-logo-grad)" />
        <text x="24" y="32" text-anchor="middle" fill="white" font-size="20" font-weight="700" font-family="system-ui, sans-serif">B+</text>
        <defs>
          <linearGradient id="pageog-logo-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stop-color="#10b981" />
            <stop offset="1" stop-color="#059669" />
          </linearGradient>
        </defs>
      </svg>
      <span class="text-xl font-semibold text-zinc-300">BetterSEQTA Plus</span>
    </div>
  </div>
</template>
