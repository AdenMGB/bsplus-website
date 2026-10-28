<template>
  <component
    :is="tag"
    ref="rootRef"
    :class="
      animateOnMount
        ? 'reveal-on-scroll-animate-on-mount'
        : ['reveal-on-scroll', { 'reveal-on-scroll--visible': isVisible }]
    "
    :style="delayStyle"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';

function resolveRootElement(
  target: HTMLElement | ComponentPublicInstance | null,
): HTMLElement | null {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  const el = target.$el;
  return el instanceof HTMLElement ? el : null;
}

const props = withDefaults(
  defineProps<{
    tag?: string;
    delay?: number;
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
    /** Run the reveal transition on mount (no scroll needed). */
    animateOnMount?: boolean;
  }>(),
  {
    tag: "div",
    delay: 0,
    threshold: 0,
    rootMargin: "0px 0px -4% 0px",
    once: true,
    animateOnMount: false,
  }
);

const { prefersReducedMotion } = usePrefersReducedMotion();

const rootRef = ref<HTMLElement | ComponentPublicInstance | null>(null);
const isVisible = ref(false);

const delayStyle = computed(() =>
  props.delay > 0 ? { "--reveal-delay": `${props.delay}ms` } : undefined
);

let observer: IntersectionObserver | null = null;

function revealNow() {
  isVisible.value = true;
}

onMounted(() => {
  if (props.animateOnMount) return;

  if (!import.meta.client) {
    revealNow();
    return;
  }

  if (prefersReducedMotion.value) {
    revealNow();
    return;
  }

  const el = resolveRootElement(rootRef.value);
  if (!el) {
    revealNow();
    return;
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      revealNow();
      if (props.once) observer?.unobserve(el);
    },
    {
      threshold: props.threshold,
      rootMargin: props.rootMargin,
    }
  );

  observer.observe(el);

  requestAnimationFrame(() => {
    const rect = el.getBoundingClientRect();
    const inView = rect.bottom > 0 && rect.top < window.innerHeight;
    if (inView) revealNow();
  });
});

onUnmounted(() => {
  observer?.disconnect();
  observer = null;
});
</script>
