<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  titleTemplate(title) {
    return title ? `${title} | BetterSEQTA+` : 'BetterSEQTA+';
  },
});

const { fetchUser } = useAuth();

if (import.meta.client) {
  onMounted(() => {
    fetchUser();
  });
}
</script>
