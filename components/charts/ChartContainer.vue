<template>
  <div ref="containerRef" :class="containerClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue';

export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
    theme?: {
      light?: string;
      dark?: string;
    };
  };
}

const props = defineProps<{
  config: ChartConfig;
  class?: string;
}>();

const containerRef = ref<HTMLElement | null>(null);
const containerClass = computed(() => `w-full ${props.class || ''}`);

// Provide config to child components
provide('chartConfig', props.config);
</script>

