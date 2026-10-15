<template>
  <section class="relative overflow-hidden">
    <div
      class="mx-auto max-w-7xl px-4 pt-28 pb-10 sm:px-6 sm:pb-14 lg:px-8 lg:pb-20"
    >
      <div ref="introBlockRef" class="mx-auto max-w-4xl text-center">
        <p
          class="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400"
        >
          BetterSEQTA Plus
        </p>
        <h1
          class="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl text-balance"
        >
          SEQTA Learn,
          <span class="block sm:inline text-zinc-400"> reimagined.</span>
        </h1>
        <p
          class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl text-pretty"
        >
          Themes, enhancements, and a desktop app that makes the portal feel like
          a real product — pick the browser extension or go all-in with DesQTA.
        </p>
      </div>

      <div
        class="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-5 lg:mt-20 lg:grid-cols-2 lg:gap-6"
      >
        <article
          v-for="(product, index) in products"
          :key="product.id"
          class="flex"
        >
          <div
            :ref="(el) => setCardRef(el, index)"
            class="ui-glass-card ui-glass-card--interactive flex h-full w-full flex-col p-7 sm:p-8"
          >
            <div class="flex items-start gap-4">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200"
                :class="product.iconWrapClass"
                aria-hidden="true"
              >
                <component
                  :is="product.icon"
                  class="h-6 w-6"
                  :class="product.iconClass"
                />
              </div>
              <div class="min-w-0 flex-1">
                <NuxtLink
                  :href="product.primaryHref"
                  class="group/meta block rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900"
                  :class="product.focusRingClass"
                >
                  <p
                    class="text-xs font-medium uppercase tracking-wide"
                    :class="product.kindClass"
                  >
                    {{ product.kind }}
                  </p>
                  <p
                    class="mt-0.5 font-mono text-sm tabular-nums text-zinc-400 transition-colors duration-200 group-hover/meta:text-zinc-300"
                  >
                    <span v-if="product.version">{{ product.version }}</span>
                    <span v-else class="text-zinc-500">Loading version…</span>
                  </p>
                </NuxtLink>
              </div>
            </div>

            <h2
              class="mt-6 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              {{ product.name }}
            </h2>
            <p class="mt-1 text-base font-medium" :class="product.taglineClass">
              {{ product.tagline }}
            </p>
            <p class="mt-3 flex-grow text-sm leading-relaxed text-zinc-300 sm:text-base">
              {{ product.description }}
            </p>

            <div
              class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <NuxtLink
                :href="product.primaryHref"
                class="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-95"
                :class="product.primaryBtnClass"
              >
                {{ product.primaryLabel }}
              </NuxtLink>
              <NuxtLink
                :href="product.secondaryHref"
                class="inline-flex items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-zinc-300 transition-colors duration-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900"
                :class="product.secondaryFocusClass"
              >
                {{ product.secondaryLabel }}
                <span class="ml-1" aria-hidden="true">→</span>
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from "gsap";
import {
  PuzzlePieceIcon,
  ComputerDesktopIcon,
} from "@heroicons/vue/24/outline";
import type { Component } from "vue";

const props = defineProps<{
  bsVersion: string | null;
  desqtaVersion: string | null;
}>();

const { prefersReducedMotion } = usePrefersReducedMotion();

type ProductCard = {
  id: string;
  name: string;
  tagline: string;
  kind: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  icon: Component;
  version: string | null;
  iconWrapClass: string;
  iconClass: string;
  kindClass: string;
  taglineClass: string;
  primaryBtnClass: string;
  focusRingClass: string;
  secondaryFocusClass: string;
};

const products = computed<ProductCard[]>(() => [
  {
    id: "ext",
    name: "BetterSEQTA+",
    tagline: "SEQTA Learn in your browser",
    kind: "Browser extension",
    description:
      "Custom themes, live wallpapers, and quality-of-life upgrades — without leaving SEQTA Learn.",
    primaryHref: "/download",
    primaryLabel: "Get BetterSEQTA+",
    secondaryHref: "#features",
    secondaryLabel: "Features",
    icon: PuzzlePieceIcon,
    version: props.bsVersion,
    iconWrapClass: "border-zinc-600/50 bg-zinc-800/40",
    iconClass: "text-zinc-300",
    kindClass: "text-zinc-500",
    taglineClass: "text-zinc-400",
    primaryBtnClass:
      "bg-zinc-600 hover:bg-zinc-500 focus:ring-zinc-400",
    focusRingClass: "focus:ring-zinc-500",
    secondaryFocusClass: "focus:ring-zinc-500",
  },
  {
    id: "desk",
    name: "DesQTA",
    tagline: "The full desktop experience",
    kind: "Desktop app",
    description:
      "Native app for Windows, Mac, and Android with offline-friendly flow and deeper system integration.",
    primaryHref: "/download",
    primaryLabel: "Download DesQTA",
    secondaryHref: "/desqta",
    secondaryLabel: "Learn more",
    icon: ComputerDesktopIcon,
    version: props.desqtaVersion,
    iconWrapClass: "border-blue-500/30 bg-blue-500/10",
    iconClass: "text-blue-300",
    kindClass: "text-blue-400/80",
    taglineClass: "text-blue-300/90",
    primaryBtnClass:
      "bg-blue-600 hover:bg-blue-500 focus:ring-blue-400",
    focusRingClass: "focus:ring-blue-500",
    secondaryFocusClass: "focus:ring-blue-500 hover:text-blue-200",
  },
]);

const introBlockRef = ref<HTMLElement | null>(null);
const cardRefs = ref<(HTMLElement | null)[]>([]);

function setCardRef(el: Element | null, index: number) {
  cardRefs.value[index] = el as HTMLElement | null;
}

onMounted(() => {
  if (!import.meta.client || prefersReducedMotion.value) return;
  const intro = introBlockRef.value;
  if (!intro) return;
  const kids = intro.querySelectorAll(":scope > *");
  gsap.from(kids, {
    opacity: 0,
    y: 32,
    duration: 0.85,
    stagger: 0.11,
    ease: "power3.out",
    delay: 0.04,
  });
  const cards = cardRefs.value.filter(Boolean);
  if (cards.length) {
    gsap.from(cards, {
      opacity: 0,
      y: 40,
      duration: 0.75,
      stagger: 0.12,
      ease: "power3.out",
      delay: 0.35,
    });
  }
});
</script>
