export default defineNuxtRouteMiddleware(async (to, from) => {
  useHead({
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  });

  const { user, fetchUser } = useAuth();

  if (!user.value) {
    await fetchUser();
  }

  if (!user.value || !user.value.admin_level || user.value.admin_level < 1) {
    return navigateTo('/');
  }
});

