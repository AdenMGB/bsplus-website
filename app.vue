<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  titleTemplate(title) {
    return title ? `${title} | BetterSEQTA Plus` : "BetterSEQTA Plus";
  },
});
</script>
