<template>
  <NuxtLayout>
    <main
      class="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8 animate-fade-in"
    >
      <div class="text-center">
        <img
          src="/images/404.jpg"
          alt="Sorry kitten"
          class="mx-auto h-64 w-64 rounded-lg object-cover shadow-lg transition-transform duration-300 hover:scale-[1.02]"
        />
        <p class="mt-6 text-xl font-medium text-zinc-300 animate-fade-in delay-100">
          Oops! Looks like this page got lost in the digital wilderness. 
          <br />
          But don't worry, this cute kitten is here to make it up to you!
        </p>
        <p class="mt-6 text-base font-semibold text-emerald-400 animate-slide-down delay-150">
          {{ error?.statusCode ?? 500 }}
        </p>
        <h1
          class="mt-4 text-balance text-5xl font-semibold tracking-tight text-zinc-100 sm:text-7xl animate-slide-down delay-200"
        >
          {{ error?.statusMessage ?? "An unknown error occurred." }}
        </h1>
        <p
          class="mt-6 text-pretty text-lg font-medium text-zinc-400 sm:text-xl/8 animate-fade-in delay-300"
        >
          {{ error?.message }}
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6 animate-fade-in delay-400">
          <NuxtLink
            href="/"
            class="ui-btn ui-btn-primary focus-visible:outline-none"
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
