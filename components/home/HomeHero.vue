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
          class="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          SEQTA Learn,
          <span class="block sm:inline text-zinc-400"> reimagined.</span>
        </h1>
        <p
          class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl"
        >
          Themes, live wallpapers, and a desktop app that makes the portal
          feel like a real product — pick the browser extension or go all-in
          with DesQTA.
        </p>
      </div>

      <div
        class="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-6 lg:mt-20 lg:grid-cols-2 lg:gap-8"
      >
        <!-- BetterSEQTA+ -->
        <article
          ref="cardExtRef"
          class="group relative perspective-1000"
          @mousemove="onTilt($event, 'ext')"
          @mouseleave="resetTilt('ext')"
        >
          <div
            ref="cardExtInnerRef"
            class="relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-600/50 bg-gradient-to-br from-zinc-800/60 via-zinc-900/70 to-zinc-950/80 p-8 shadow-xl backdrop-blur-sm transition-transform duration-200 will-change-transform sm:p-10"
            style="transform-style: preserve-3d"
          >
            <div
              class="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/5 blur-3xl transition-opacity duration-500 group-hover:opacity-80"
              aria-hidden="true"
            />
            <div
              class="mb-6 flex items-center gap-2 rounded-lg border border-zinc-600/60 bg-zinc-950/60 px-3 py-2 text-left text-xs text-zinc-400"
              aria-hidden="true"
            >
              <span class="inline-flex gap-1.5">
                <span class="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span class="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </span>
              <span class="ml-2 flex-1 truncate rounded bg-zinc-800/80 px-2 py-0.5 text-zinc-500"
                >seqta.learn / home</span
              >
            </div>
            <NuxtLink
              href="/download"
              class="mb-4 inline-flex flex-wrap items-center justify-center gap-2 self-center sm:self-start"
            >
              <span
                class="rounded-full bg-zinc-500/20 px-3 py-1 text-xs font-semibold text-zinc-200 ring-1 ring-inset ring-zinc-500/40 animate-pulse-subtle"
              >
                Latest release
              </span>
              <span
                class="inline-flex items-center gap-1 text-xs font-medium text-zinc-300"
              >
                <span v-if="bsVersion">{{ bsVersion }}</span>
                <span v-else>Loading…</span>
              </span>
            </NuxtLink>
            <h2
              class="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              BetterSEQTA+
            </h2>
            <p class="mt-1 text-lg font-medium text-zinc-400">
              SEQTA Learn in your browser
            </p>
            <p class="mt-4 flex-grow text-base leading-relaxed text-zinc-300">
              Drop-in extension: custom themes, live wallpapers, and quality-of-life
              upgrades without leaving the site you already use.
            </p>
            <div
              class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <NuxtLink
                href="/download"
                class="inline-flex items-center justify-center rounded-lg bg-zinc-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-95"
              >
                Get BetterSEQTA+
              </NuxtLink>
              <NuxtLink
                href="#features"
                class="inline-flex items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                Features <span class="ml-1" aria-hidden="true">→</span>
              </NuxtLink>
            </div>
          </div>
        </article>

        <!-- DesQTA -->
        <article
          ref="cardDeskRef"
          class="group relative perspective-1000"
          @mousemove="onTilt($event, 'desk')"
          @mouseleave="resetTilt('desk')"
        >
          <div
            ref="cardDeskInnerRef"
            class="relative flex h-full flex-col overflow-hidden rounded-2xl border border-blue-500/35 bg-gradient-to-br from-blue-950/40 via-zinc-900/80 to-zinc-950/90 p-8 shadow-xl shadow-blue-950/20 backdrop-blur-sm transition-transform duration-200 will-change-transform sm:p-10"
            style="transform-style: preserve-3d"
          >
            <div
              class="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden="true"
            />
            <div
              class="pointer-events-none absolute right-4 top-6 flex flex-col gap-2 opacity-60"
              aria-hidden="true"
            >
              <div
                class="h-16 w-28 rounded-lg border border-blue-500/20 bg-zinc-900/80 shadow-lg"
              />
              <div
                class="ml-4 h-14 w-28 rounded-lg border border-blue-400/15 bg-zinc-900/70 shadow-md"
              />
            </div>
            <NuxtLink
              href="/download"
              class="relative z-10 mb-4 inline-flex flex-wrap items-center justify-center gap-2 self-center sm:self-start"
            >
              <span
                class="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 ring-1 ring-inset ring-blue-500/40 animate-pulse-subtle"
              >
                Desktop app
              </span>
              <span
                class="inline-flex items-center gap-1 text-xs font-medium text-zinc-200"
              >
                <span v-if="desqtaVersion">{{ desqtaVersion }}</span>
                <span v-else>Loading…</span>
              </span>
            </NuxtLink>
            <h2
              class="relative z-10 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              DesQTA
            </h2>
            <p class="relative z-10 mt-1 text-lg font-medium text-blue-300">
              The full desktop experience
            </p>
            <p
              class="relative z-10 mt-4 flex-grow text-base leading-relaxed text-zinc-300"
            >
              Native app for Windows, Mac, and Android: offline-friendly flow,
              system integration, and room to grow beyond the browser.
            </p>
            <div
              class="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <NuxtLink
                href="/download"
                class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-95"
              >
                Download DesQTA
              </NuxtLink>
              <NuxtLink
                href="/desqta"
                class="inline-flex items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                Learn more <span class="ml-1" aria-hidden="true">→</span>
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

defineProps<{
  bsVersion: string | null;
  desqtaVersion: string | null;
}>();

const { prefersReducedMotion } = usePrefersReducedMotion();

const introBlockRef = ref<HTMLElement | null>(null);
const cardExtInnerRef = ref<HTMLElement | null>(null);
const cardDeskInnerRef = ref<HTMLElement | null>(null);

/**
 * Peak movement near the card centre; dampen toward edges/corners.
 * Centre can exceed previous max; edges stay subtle.
 */
const MAX_TILT_DEG = 16;
const MAX_SHIFT_PX = 22;
const TILT_PERSPECTIVE = 920;
const EDGE_FLOOR = 0.14;
const CENTER_CEILING = 1.38;

function tiltIntensity(px: number, py: number) {
  const dist = Math.sqrt(px * px + py * py);
  const radial = Math.min(dist / 0.52, 1);
  const towardCenter = 1 - radial;
  return EDGE_FLOOR + CENTER_CEILING * towardCenter * towardCenter;
}

function onTilt(e: MouseEvent, which: "ext" | "desk") {
  if (prefersReducedMotion.value) return;
  const el = (which === "ext" ? cardExtInnerRef : cardDeskInnerRef).value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5;
  const py = (e.clientY - r.top) / r.height - 0.5;
  const k = tiltIntensity(px, py);
  const rx = -py * 2 * MAX_TILT_DEG * k;
  const ry = px * 2 * MAX_TILT_DEG * k;
  const tx = px * 2 * MAX_SHIFT_PX * k;
  const ty = py * 2 * MAX_SHIFT_PX * k;
  const scale = 1 + 0.03 * k;
  el.style.transform = `perspective(${TILT_PERSPECTIVE}px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${tx}px,${ty}px,0) scale3d(${scale},${scale},1)`;
}

function resetTilt(which: "ext" | "desk") {
  const el = (which === "ext" ? cardExtInnerRef : cardDeskInnerRef).value;
  if (!el) return;
  el.style.transform = "";
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
});
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

@keyframes pulse-subtle {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2.5s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-pulse-subtle {
    animation: none;
  }
}
</style>
