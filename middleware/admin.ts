export default defineNuxtRouteMiddleware(async (to, from) => {
  useHead({
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  });

  const { user, fetchUser } = useAuth();

  // Always fetch - on server we must forward cookies (SSR/refresh) or /api/auth/me gets no auth
  const headers = import.meta.server ? (useRequestHeaders(['cookie']) as Record<string, string>) : undefined;
  await fetchUser(headers);

  if (!user.value || !user.value.admin_level || user.value.admin_level < 1) {
    return navigateTo('/');
  }
});

