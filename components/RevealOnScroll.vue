<template>
  <component
    :is="tag"
    ref="rootRef"
    class="reveal-on-scroll"
    :class="{ 'reveal-on-scroll--visible': isVisible }"
    :style="delayStyle"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tag?: string;
    delay?: number;
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
  }>(),
  {
    tag: "div",
    delay: 0,
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px",
    once: true,
  }
);

const { prefersReducedMotion } = usePrefersReducedMotion();

const rootRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);

const delayStyle = computed(() =>
  props.delay > 0 ? { "--reveal-delay": `${props.delay}ms` } : undefined
);

let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!import.meta.client) return;

  if (prefersReducedMotion.value) {
    isVisible.value = true;
    return;
  }

  const el = rootRef.value;
  if (!el) return;

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      isVisible.value = true;
      if (props.once) observer?.unobserve(el);
    },
    {
      threshold: props.threshold,
      rootMargin: props.rootMargin,
    }
  );

  observer.observe(el);
});

onUnmounted(() => {
  observer?.disconnect();
  observer = null;
});
</script>
