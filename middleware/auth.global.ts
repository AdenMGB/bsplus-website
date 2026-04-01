export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return;
  }

  const { user, loading, fetchUser } = useAuth();

  if (loading.value) {
    return;
  }

  if (user.value) {
    return;
  }

  try {
    await fetchUser();
  } catch {
    return;
  }
});
