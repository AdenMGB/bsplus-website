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

const { accessToken, fetchUser } = useAuth();

if (import.meta.client) {
  const authTokenCookie = useCookie<string | null>('auth_token', {
    default: () => null,
  });

  if (!accessToken.value && authTokenCookie.value) {
    accessToken.value = authTokenCookie.value;
  }

  onMounted(() => {
    fetchUser();
  });
}
</script>
