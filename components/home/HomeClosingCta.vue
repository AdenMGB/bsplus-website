<template>
  <section ref="sectionRef" class="relative px-4 pb-28 pt-12 sm:px-6 lg:px-8 lg:pb-36 lg:pt-20">
    <div
      class="pointer-events-none absolute inset-0 -z-10 opacity-40"
      aria-hidden="true"
    >
      <svg
        class="h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
      >
        <defs>
          <pattern
            id="home-cta-grid"
            width="200"
            height="200"
            x="50%"
            y="0"
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y="0" class="overflow-visible fill-white/5">
          <path
            d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z M-600 200h201v201h-201Z M400 400h201v201h-201Z M-200 400h201v201h-201Z M200 0h201v201h-201Z M-400 0h201v201h-201Z M0 200h201v201h-201Z M-200 600h201v201h-201Z M400 800h201v201h-201Z"
            stroke-width="0"
          />
        </svg>
        <rect width="100%" height="100%" stroke-width="0" fill="url(#home-cta-grid)" />
      </svg>
    </div>

    <div
      class="spotlight-wrap relative mx-auto max-w-2xl rounded-2xl p-[1px] transition-opacity duration-500"
      @mousemove="onSpotlight"
      @mouseleave="resetSpotlight"
    >
      <div
        class="spotlight-glow pointer-events-none absolute -inset-px rounded-2xl opacity-90"
        aria-hidden="true"
      />
      <div
        class="relative rounded-2xl border border-white/10 bg-zinc-900/80 px-8 py-12 text-center shadow-2xl backdrop-blur-xl sm:px-12 sm:py-14"
      >
        <h2
          ref="headingRef"
          class="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Ready to transform SEQTA?
        </h2>
        <p
          ref="subRef"
          class="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-zinc-300"
        >
          Extension or desktop — pick your lane and get set up in minutes. If you
          are not sure which to use, open the comparison and decide from there.
        </p>
        <!-- Stacked only: same horizontal centre as the heading (row layout pushed “Compare” to the right) -->
        <div
          ref="actionsRef"
          class="mx-auto mt-10 flex w-full max-w-sm flex-col items-stretch gap-3"
        >
          <NuxtLink
            href="/download"
            class="flex w-full items-center justify-center rounded-lg bg-zinc-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-[0.98]"
          >
            Download now
          </NuxtLink>
          <NuxtLink
            href="/comparison"
            class="flex w-full items-center justify-center rounded-lg py-2.5 text-center text-sm font-semibold text-white transition-colors duration-200 hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Compare features<span class="ml-1 inline-block" aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const { prefersReducedMotion } = usePrefersReducedMotion();

const sectionRef = ref<HTMLElement | null>(null);
const headingRef = ref<HTMLElement | null>(null);
const subRef = ref<HTMLElement | null>(null);
const actionsRef = ref<HTMLElement | null>(null);

function onSpotlight(e: MouseEvent) {
  if (prefersReducedMotion.value) return;
  const wrap = (e.currentTarget as HTMLElement).closest(".spotlight-wrap");
  if (!wrap) return;
  const r = wrap.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 100;
  const y = ((e.clientY - r.top) / r.height) * 100;
  wrap.style.setProperty("--sx", `${x}%`);
  wrap.style.setProperty("--sy", `${y}%`);
}

function resetSpotlight(e: MouseEvent) {
  const wrap = (e.currentTarget as HTMLElement).closest(".spotlight-wrap");
  if (!wrap) return;
  wrap.style.setProperty("--sx", "50%");
  wrap.style.setProperty("--sy", "40%");
}

onMounted(() => {
  if (!import.meta.client) return;

  const heading = headingRef.value;
  const sub = subRef.value;
  const actions = actionsRef.value;
  const section = sectionRef.value;
  if (!heading || !sub || !actions || !section) return;

  if (prefersReducedMotion.value) {
    return;
  }

  gsap.from([heading, sub, actions.children], {
    scrollTrigger: {
      trigger: section,
      start: "top 78%",
      toggleActions: "play none none reverse",
      id: "home-cta-reveal",
    },
    opacity: 0,
    y: 40,
    duration: 0.7,
    stagger: 0.1,
    ease: "power3.out",
  });
});

onUnmounted(() => {
  ScrollTrigger.getById("home-cta-reveal")?.kill();
});
</script>

<style scoped>
.spotlight-wrap {
  --sx: 50%;
  --sy: 35%;
}

.spotlight-glow {
  background: radial-gradient(
    600px circle at var(--sx) var(--sy),
    rgba(96, 165, 250, 0.22),
    rgba(63, 63, 70, 0.15) 40%,
    transparent 65%
  );
}

@media (prefers-reduced-motion: reduce) {
  .spotlight-glow {
    background: linear-gradient(
      135deg,
      rgba(96, 165, 250, 0.12),
      rgba(63, 63, 70, 0.2)
    );
  }
}
</style>
