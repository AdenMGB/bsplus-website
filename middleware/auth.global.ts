export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return;
  }

  const { user, loading, fetchUser } = useAuth();

  if (loading.value || !user.value) {
    try {
      await fetchUser();
    } catch {
      return;
    }
  }
});
