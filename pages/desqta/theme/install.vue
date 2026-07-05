<template>
  <div class="flex min-h-[50vh] items-center justify-center px-6 py-24">
    <div class="max-w-md text-center">
      <template v-if="themeId">
        <p class="text-lg font-medium text-white">Opening DesQTA…</p>
        <p class="mt-3 text-sm text-zinc-400">
          If DesQTA does not open,
          <NuxtLink to="/download" class="text-sky-400 underline-offset-2 hover:underline">download the app</NuxtLink>.
        </p>
      </template>
      <template v-else>
        <p class="text-lg font-medium text-white">Invalid theme link</p>
        <p class="mt-3 text-sm text-zinc-400">
          A valid theme UUID is required. Browse themes on the
          <NuxtLink to="/themes?type=desqta" class="text-sky-400 underline-offset-2 hover:underline">theme store</NuxtLink>.
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  openDesqtaThemeInstall,
  resolveDesqtaThemeIdFromQuery,
} from '~/utils/desqtaThemeLinks';

const route = useRoute();
const themeId = computed(() =>
  resolveDesqtaThemeIdFromQuery(route.query as Record<string, string | string[] | undefined>)
);

usePageSeo({
  title: 'Install theme in DesQTA',
  description: 'Open a theme from the BetterSEQTA store in DesQTA for preview and installation.',
  noIndex: true,
});

onMounted(() => {
  if (!themeId.value) return;
  openDesqtaThemeInstall(themeId.value);
});
</script>
