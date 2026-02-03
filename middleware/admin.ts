export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, fetchUser } = useAuth();
  
  if (!user.value) {
    await fetchUser();
  }

  if (!user.value || !user.value.admin_level || user.value.admin_level < 1) {
    return navigateTo('/');
  }
});

