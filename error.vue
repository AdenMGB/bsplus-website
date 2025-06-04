<template>
  <NuxtLayout>
    <main
      class="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8"
    >
      <div class="text-center">
        <p class="text-base font-semibold text-blue-600">
          {{ error?.statusCode ?? 500 }}
        </p>
        <h1
          class="mt-4 text-balance text-5xl font-semibold tracking-tight text-zinc-100 sm:text-7xl"
        >
          {{ error?.statusMessage ?? "An unknown error occurred." }}
        </h1>
        <p
          class="mt-6 text-pretty text-lg font-medium text-zinc-400 sm:text-xl/8"
        >
          {{ error?.message }}
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <NuxtLink
            href="/"
            class="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >Go back home</NuxtLink
          >
        </div>
      </div>
    </main>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { NuxtError } from "#app";

const { error } = defineProps<{
  error: NuxtError;
}>();

defineOgImageComponent("NuxtSeo", {
  title: error.statusCode.toString(),
  description: error.statusMessage,
});
</script>
