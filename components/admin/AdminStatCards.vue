<template>
  <div class="mb-8 grid grid-cols-2 gap-4" :class="gridClass">
    <div
      v-for="card in cards"
      :key="card.label"
      class="rounded-2xl border bg-zinc-900/50 p-4 transition-all duration-200 hover:scale-[1.02] sm:p-5"
      :class="card.borderClass || 'border-zinc-800'"
    >
      <dt class="text-xs text-zinc-500 sm:text-sm">{{ card.label }}</dt>
      <dd class="mt-1 text-2xl font-bold text-white sm:mt-2 sm:text-3xl" :class="card.valueClass">
        {{ card.value }}
      </dd>
      <p v-if="card.hint" class="mt-1 text-xs text-zinc-500">{{ card.hint }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
export type AdminStatCard = {
  label: string;
  value: string | number;
  hint?: string;
  borderClass?: string;
  valueClass?: string;
};

const props = withDefaults(
  defineProps<{
    cards: AdminStatCard[];
    columns?: 2 | 3 | 4;
  }>(),
  { columns: 4 },
);

const gridClass = computed(() => {
  if (props.columns === 2) return 'lg:grid-cols-2';
  if (props.columns === 3) return 'lg:grid-cols-3';
  return 'lg:grid-cols-4';
});
</script>
