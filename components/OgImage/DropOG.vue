<script lang="ts" setup>
/**
 * DesQTA OG image template.
 * 1200x630 - standard OG dimensions.
 * Full bleed, site-themed, with logo.
 */
import { computed } from 'vue';

const {
  title: propTitle = 'DesQTA',
  description = 'description',
  headline = 'v0.2',
} = defineProps<{
  title?: string;
  description?: string;
  headline?: string;
}>();

const title = computed(() => String(propTitle || 'DesQTA').slice(0, 60));
const desc = computed(() => String(description || '').slice(0, 200));

defineOgImageComponent('DesQTAOG', {
  title: 'DesQTA',
});
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
        <radialGradient id="dropog-grad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" style="stop-color:#18181b" />
          <stop offset="100%" style="stop-color:#09090b" />
        </radialGradient>
        <filter id="dropog-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="110" />
        </filter>
      </defs>
      <rect x="0" y="0" width="1200" height="630" fill="url(#dropog-grad)" />
      <g style="mix-blend-mode: overlay" opacity="0.15">
        <circle cx="901.5" cy="45.5" r="199.5" fill="#27272a" filter="url(#dropog-blur)" />
        <circle cx="600.5" cy="216.5" r="199.5" fill="#3f3f46" filter="url(#dropog-blur)" />
        <circle cx="179.5" cy="317.5" r="199.5" fill="#52525b" filter="url(#dropog-blur)" />
      </g>
      <circle cx="900" cy="120" r="180" fill="#3b82f6" filter="url(#dropog-blur)" opacity="0.1" />
    </svg>

    <div class="relative z-10 flex flex-1 items-center justify-between">
      <div class="max-w-[600px]">
        <p
          v-if="headline"
          class="mb-4 text-2xl font-semibold uppercase tracking-wide text-blue-400"
        >
          {{ headline }}
        </p>
        <h1 class="m-0 mb-4 text-[72px] font-semibold leading-tight text-white">
          {{ title }}
        </h1>
        <p v-if="desc" class="text-3xl leading-snug text-zinc-400">
          {{ desc }}
        </p>
      </div>

      <!-- Logo on the right - inline SVG for reliability -->
      <div style="flex-shrink: 0;">
        <svg width="140" height="140" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#dropog-logo-grad)" />
          <text x="24" y="32" text-anchor="middle" fill="white" font-size="20" font-weight="700" font-family="system-ui, sans-serif">B+</text>
          <defs>
            <linearGradient id="dropog-logo-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stop-color="#3b82f6" />
              <stop offset="1" stop-color="#2563eb" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>

    <!-- Bottom bar with site name -->
    <div class="relative z-10 mt-8 flex items-center gap-4">
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0; border-radius: 8px;">
        <rect width="48" height="48" rx="8" fill="url(#dropog-bar-grad)" />
        <text x="24" y="32" text-anchor="middle" fill="white" font-size="18" font-weight="700" font-family="system-ui, sans-serif">B+</text>
        <defs>
          <linearGradient id="dropog-bar-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stop-color="#10b981" />
            <stop offset="1" stop-color="#059669" />
          </linearGradient>
        </defs>
      </svg>
      <span class="text-lg font-semibold text-zinc-400">BetterSEQTA Plus</span>
    </div>
  </div>
</template>
