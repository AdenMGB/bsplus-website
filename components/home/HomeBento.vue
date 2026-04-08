<template>
  <section id="features" class="py-20 sm:py-28 lg:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center lg:max-w-3xl">
        <p
          ref="labelRef"
          class="text-sm font-semibold uppercase tracking-widest text-zinc-400"
        >
          Everything in one ecosystem
        </p>
        <h2
          ref="titleRef"
          class="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl"
        >
          Built for students who use SEQTA daily
        </h2>
        <p
          ref="leadRef"
          class="mt-6 text-lg leading-relaxed text-zinc-300"
        >
          From quick visual tweaks in the browser to a full desktop shell — the
          same community themes and the same mission: make SEQTA tolerable,
          even enjoyable.
        </p>
      </div>

      <div
        class="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-24 lg:grid-cols-12 lg:gap-5"
      >
        <article
          v-for="(tile, i) in tiles"
          :key="tile.title"
          :ref="(el) => setTileRef(el, i)"
          class="bento-tile group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-md transition-colors duration-200 sm:p-8"
          :class="tile.span"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            :class="tile.glow"
            aria-hidden="true"
          />
          <div class="relative z-10">
            <component
              :is="tile.icon"
              class="h-8 w-8 text-zinc-300 transition-transform duration-200 group-hover:scale-110"
              aria-hidden="true"
            />
            <h3 class="mt-4 text-lg font-semibold text-white">
              {{ tile.title }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-zinc-300 sm:text-base">
              {{ tile.body }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  PaintBrushIcon,
  PhotoIcon,
  MoonIcon,
  ShoppingBagIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/vue/24/outline";

const { prefersReducedMotion } = usePrefersReducedMotion();

const labelRef = ref<HTMLElement | null>(null);
const titleRef = ref<HTMLElement | null>(null);
const leadRef = ref<HTMLElement | null>(null);
const tileRefs = ref<(HTMLElement | null)[]>([]);

const tiles = [
  {
    title: "Beautiful themes",
    body: "Community-made packs and dark palettes that match how you actually want to work.",
    span: "lg:col-span-5 min-h-[180px]",
    glow: "bg-gradient-to-br from-zinc-500/10 to-transparent",
    icon: PaintBrushIcon,
  },
  {
    title: "Live wallpapers",
    body: "Motion and depth behind the UI — subtle, not distracting.",
    span: "lg:col-span-7 min-h-[180px]",
    glow: "bg-gradient-to-bl from-blue-500/10 to-transparent",
    icon: PhotoIcon,
  },
  {
    title: "Dark mode done right",
    body: "Easier on the eyes for late-night assessment crunches.",
    span: "lg:col-span-4 min-h-[160px]",
    glow: "bg-gradient-to-tr from-zinc-400/10 to-transparent",
    icon: MoonIcon,
  },
  {
    title: "Theme store",
    body: "Browse and install from betterseqta.org — one hub for extension and DesQTA packages.",
    span: "lg:col-span-4 min-h-[160px]",
    glow: "bg-gradient-to-tl from-blue-400/10 to-transparent",
    icon: ShoppingBagIcon,
  },
  {
    title: "Speed where it counts",
    body: "DesQTA keeps the experience snappy with native windows and smarter caching.",
    span: "lg:col-span-4 min-h-[160px]",
    glow: "bg-gradient-to-br from-blue-500/15 to-transparent",
    icon: BoltIcon,
  },
  {
    title: "Cross-platform",
    body: "Windows, macOS, Android — use what you already carry.",
    span: "lg:col-span-12 min-h-[140px]",
    glow: "bg-gradient-to-r from-zinc-500/10 via-blue-500/10 to-zinc-500/10",
    icon: DevicePhoneMobileIcon,
  },
];

function setTileRef(el: Element | unknown, i: number) {
  tileRefs.value[i] = el instanceof HTMLElement ? el : null;
}

const tileTriggers: ScrollTrigger[] = [];

onMounted(() => {
  if (!import.meta.client) return;

  const headerEls = [labelRef.value, titleRef.value, leadRef.value].filter(
    Boolean
  ) as HTMLElement[];

  if (prefersReducedMotion.value) {
    return;
  }

  const headerTrigger = labelRef.value?.parentElement;
  if (headerTrigger) {
    gsap.from(headerEls, {
      scrollTrigger: {
        trigger: headerTrigger,
        start: "top 82%",
        toggleActions: "play none none reverse",
        id: "home-bento-header",
      },
      opacity: 0,
      y: 36,
      duration: 0.75,
      stagger: 0.1,
      ease: "power3.out",
    });
  }

  nextTick(() => {
    const tileEls = tileRefs.value.filter(Boolean) as HTMLElement[];
    gsap.set(tileEls, { opacity: 0, y: 52 });
    tileEls.forEach((el, index) => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        id: `home-bento-tile-${index}`,
        onEnter: () => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 52 },
            { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" }
          );
        },
      });
      tileTriggers.push(st);
    });
  });
});

onUnmounted(() => {
  ScrollTrigger.getById("home-bento-header")?.kill();
  tileTriggers.splice(0).forEach((t) => t.kill());
});
</script>

<style scoped>
.bento-tile {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
}
</style>
