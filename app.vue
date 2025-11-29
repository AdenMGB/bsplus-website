<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';

useHead({
  titleTemplate(title) {
    return title ? `${title} | BetterSEQTA+` : "BetterSEQTA+";
  },
});

const { fetchUser } = useAuth();
onMounted(() => {
  fetchUser();
});
</script>
