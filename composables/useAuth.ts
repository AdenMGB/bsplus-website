export const useAuth = () => {
  const user = useState<any | null>('auth_user', () => null);
  const loading = useState<boolean>('auth_loading', () => true);

  const fetchUser = async (headers?: Record<string, string>) => {
    loading.value = true;
    try {
      const data = await $fetch('/api/auth/me', { headers });
      user.value = data;
    } catch (e) {
      user.value = null;
    } finally {
      loading.value = false;
    }
  };

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' });
      user.value = null;
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return {
    user,
    loading,
    fetchUser,
    login,
    logout,
  };
};

