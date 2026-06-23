export default defineNuxtRouteMiddleware(async (to) => {
  useHead({
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  });

  const { user, fetchUser } = useAuth();

  const headers = import.meta.server ? (useRequestHeaders(['cookie']) as Record<string, string>) : undefined;
  await fetchUser(headers);

  if (!user.value || !user.value.admin_level || user.value.admin_level < 1) {
    const redirect = encodeURIComponent(to.fullPath);
    return navigateTo(`/api/auth/login?redirect=${redirect}`);
  }
});
