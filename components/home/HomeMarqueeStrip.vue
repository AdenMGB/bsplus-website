<template>
  <section class="border-y border-white/10 py-12 sm:py-16">
    <div class="relative overflow-hidden">
      <!-- No gap between duplicate rows so -50% scroll loops seamlessly -->
      <div class="marquee-track flex w-max" aria-hidden="true">
        <div
          v-for="repeat in 2"
          :key="repeat"
          class="flex shrink-0 items-center gap-10 sm:gap-14 pr-10 sm:pr-14"
        >
          <span
            v-for="item in items"
            :key="`${repeat}-${item}`"
            class="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400"
          >
            {{ item }}
          </span>
        </div>
      </div>
    </div>

    <div class="mx-auto mt-12 max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-8">
      <p class="text-center text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Platforms &amp; polish
      </p>
      <div
        class="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
      >
        <span
          v-for="chip in chips"
          :key="chip"
          class="inline-flex rounded-full border border-white/10 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all duration-200 hover:border-blue-500/40 hover:text-white"
        >
          {{ chip }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const items = [
  "Themes",
  "Live wallpapers",
  "Dark mode",
  "Notifications",
  "Theme store",
  "Open source",
  "BetterSEQTA+",
  "DesQTA",
];

const chips = [
  "Windows",
  "macOS",
  "Android",
  "Chrome / Edge",
  "Community themes",
  "Cloud sync (optional)",
];
</script>

<style scoped>
.marquee-track {
  animation: marquee 28s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }
}
</style>
