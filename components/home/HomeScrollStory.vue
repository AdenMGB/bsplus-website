<template>
  <section
    ref="sectionRef"
    class="relative"
    :class="reduced ? 'py-20 sm:py-28' : ''"
    :style="reduced ? undefined : { minHeight: 'min(320vh, 2800px)' }"
  >
    <div
      ref="pinRef"
      class="flex min-h-[72vh] items-center justify-center px-4 sm:px-6 lg:min-h-[80vh] lg:px-8"
    >
      <div class="mx-auto w-full max-w-3xl text-center">
        <template v-if="reduced">
          <h2 class="font-display text-3xl font-bold text-white sm:text-4xl">
            Choose your workflow
          </h2>
          <ul class="mt-10 space-y-8 text-left">
            <li
              v-for="(s, i) in steps"
              :key="i"
              class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <p class="text-sm font-semibold text-blue-400">{{ s.kicker }}</p>
              <p class="mt-2 text-xl font-semibold text-white">{{ s.title }}</p>
              <p class="mt-2 text-base leading-relaxed text-zinc-300">
                {{ s.body }}
              </p>
            </li>
          </ul>
        </template>
        <template v-else>
          <div
            ref="stepsWrapRef"
            class="relative mx-auto min-h-[280px] w-full sm:min-h-[340px]"
          >
            <div
              v-for="(step, i) in steps"
              :key="i"
              class="story-step absolute inset-0 flex flex-col justify-center px-2 text-center"
            >
              <p
                class="text-sm font-semibold uppercase tracking-widest text-blue-400"
              >
                {{ step.kicker }}
              </p>
              <h2
                class="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl"
              >
                {{ step.title }}
              </h2>
              <p
                class="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-300"
              >
                {{ step.body }}
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const { prefersReducedMotion } = usePrefersReducedMotion();

const sectionRef = ref<HTMLElement | null>(null);
const pinRef = ref<HTMLElement | null>(null);
const stepsWrapRef = ref<HTMLElement | null>(null);

const reduced = computed(() => prefersReducedMotion.value);

const steps = [
  {
    kicker: "Step 1",
    title: "You already live in the browser",
    body: "SEQTA Learn runs in Chrome or Edge — most students never leave that tab. BetterSEQTA+ meets you there with zero friction.",
  },
  {
    kicker: "Step 2",
    title: "Level up with BetterSEQTA+",
    body: "Install the extension and unlock themes, live wallpapers, dark mode, and polish that makes daily use less painful.",
  },
  {
    kicker: "Step 3",
    title: "Or graduate to DesQTA",
    body: "When you want a dedicated app — notifications, offline moments, and desktop muscle — DesQTA is the same ecosystem, fuller experience.",
  },
];

let stInstance: ScrollTrigger | null = null;

onMounted(() => {
  if (!import.meta.client || prefersReducedMotion.value) return;

  nextTick(() => {
    const section = sectionRef.value;
    const pin = pinRef.value;
    const wrap = stepsWrapRef.value;
    if (!section || !pin || !wrap) return;

    const els = [...wrap.querySelectorAll<HTMLElement>(".story-step")];
    if (els.length < 3) return;

    gsap.set(els[0], { opacity: 1, y: 0 });
    gsap.set([els[1], els[2]], { opacity: 0, y: 44 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=280%",
        // GSAP accepts HTMLElement; Vue template ref typing is wider than DOMTarget
        pin: pin as unknown as Element,
        scrub: 0.85,
        anticipatePin: 1,
        id: "home-scroll-story",
      },
    });

    // Sequential beats: each step fully hides before the next fades in (small dead air for scrub)
    const fadeOut = 0.48;
    const fadeIn = 0.52;
    const gap = 0.22;

    let t = 0.12;
    tl.to(
      els[0],
      { opacity: 0, y: -36, duration: fadeOut, ease: "power2.in" },
      t
    );
    t += fadeOut + gap;

    tl.fromTo(
      els[1],
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: fadeIn, ease: "power2.out" },
      t
    );
    t += fadeIn + 0.35;

    tl.to(
      els[1],
      { opacity: 0, y: -36, duration: fadeOut, ease: "power2.in" },
      t
    );
    t += fadeOut + gap;

    tl.fromTo(
      els[2],
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: fadeIn, ease: "power2.out" },
      t
    );

    stInstance = tl.scrollTrigger ?? null;
  });
});

onUnmounted(() => {
  stInstance?.kill();
  stInstance = null;
});
</script>
