<script setup lang="ts">
import { badgeByKey, formatSignupDate } from '~/utils/badges';

const props = withDefaults(
  defineProps<{
    badgeKey: string;
    signupNumber?: number | null;
    signedUpAt?: number | null;
    size?: 'sm' | 'md';
  }>(),
  {
    signupNumber: null,
    signedUpAt: null,
    size: 'md',
  }
);

const badge = computed(() => badgeByKey(props.badgeKey));

const tooltip = computed(() => {
  if (!badge.value) return '';
  const parts = [badge.value.label];
  if (props.signupNumber) {
    parts.push(`User #${props.signupNumber.toLocaleString()}`);
  }
  if (props.signedUpAt) {
    parts.push(`Signed up ${formatSignupDate(props.signedUpAt)}`);
  }
  return parts.join(' — ');
});

const sizeClasses = computed(() =>
  props.size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
);
</script>

<template>
  <span
    v-if="badge"
    :title="tooltip"
    class="group relative inline-flex items-center rounded-full font-semibold text-zinc-950 shadow-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
    :class="[sizeClasses, `bg-gradient-to-r ${badge.gradient}`, 'animate-shimmer bg-[length:200%_100%]']"
  >
    <span class="pointer-events-none absolute -inset-1 rounded-full bg-white/20 opacity-0 blur transition-opacity duration-200 group-hover:opacity-100" />
    <span class="relative">{{ badge.label }}</span>
  </span>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.animate-shimmer {
  animation: shimmer 3s ease-in-out infinite;
}
</style>
