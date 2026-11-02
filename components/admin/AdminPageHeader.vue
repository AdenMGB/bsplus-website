<template>
  <div class="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
      <NuxtLink
        to="/admin"
        class="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-zinc-400 transition-colors duration-200 hover:text-white"
      >
        &larr; Dashboard
      </NuxtLink>
      <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">{{ title }}</h1>
      <p v-if="description" class="mt-2 text-base text-zinc-400 sm:text-lg">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>
