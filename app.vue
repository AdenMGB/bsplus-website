<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { AUTH_TOKEN_COOKIE_MAX_AGE_SEC } from '~/utils/auth-session';

useHead({
  titleTemplate(title) {
    return title ? `${title} | BetterSEQTA+` : 'BetterSEQTA+';
  },
});

const { accessToken, fetchUser } = useAuth();

if (import.meta.client) {
  const authTokenCookie = useCookie<string | null>('auth_token', {
    default: () => null,
    maxAge: AUTH_TOKEN_COOKIE_MAX_AGE_SEC,
  });

  if (!accessToken.value && authTokenCookie.value) {
    accessToken.value = authTokenCookie.value;
  }

  onMounted(() => {
    fetchUser();
  });
}
</script>
