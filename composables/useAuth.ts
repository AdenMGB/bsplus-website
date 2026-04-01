type AuthUser = Record<string, any> | null;

interface RefreshResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
}

export const useAuth = () => {
  const user = useState<AuthUser>('auth_user', () => null);
  const loading = useState<boolean>('auth_loading', () => true);
  const accessToken = useState<string | null>('auth_access_token', () => null);

  const getAuthHeaders = (headers?: Record<string, string>) => {
    const nextHeaders: Record<string, string> = { ...(headers || {}) };
    if (!nextHeaders.authorization && accessToken.value) {
      nextHeaders.authorization = `Bearer ${accessToken.value}`;
    }
    return nextHeaders;
  };

  const clearAuthState = () => {
    accessToken.value = null;
    user.value = null;
  };

  const refreshAccessToken = async () => {
    const response = await $fetch<RefreshResponse>('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    accessToken.value = response.access_token;
    return response;
  };

  const fetchUser = async (headers?: Record<string, string>) => {
    loading.value = true;
    const hasProvidedAuthContext = Boolean(
      headers?.authorization || headers?.Authorization || headers?.cookie || headers?.Cookie
    );

    const fetchMe = async () => {
      const data = await $fetch('/api/auth/me', {
        headers: getAuthHeaders(headers),
        credentials: 'include',
      });
      user.value = data;
      return data;
    };

    try {
      if (!accessToken.value && !hasProvidedAuthContext) {
        try {
          await refreshAccessToken();
        } catch (refreshError: any) {
          const refreshStatus = refreshError?.statusCode || refreshError?.response?.status;
          if (refreshStatus === 401) {
            clearAuthState();
            return null;
          }
          throw refreshError;
        }
      }

      return await fetchMe();
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.response?.status;
      if (statusCode !== 401) {
        throw error;
      }

      try {
        await refreshAccessToken();
        return await fetchMe();
      } catch (refreshError: any) {
        const refreshStatus = refreshError?.statusCode || refreshError?.response?.status;
        if (refreshStatus === 401) {
          clearAuthState();
          return null;
        }
        throw refreshError;
      }
    } finally {
      loading.value = false;
    }
  };

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      clearAuthState();
    }
  };

  const logoutAll = async () => {
    try {
      await $fetch('/api/auth/logout-all', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
    } finally {
      clearAuthState();
    }
  };

  const setAccessToken = (token: string | null) => {
    accessToken.value = token;
  };

  return {
    user,
    loading,
    accessToken,
    setAccessToken,
    fetchUser,
    refreshAccessToken,
    login,
    logout,
    logoutAll,
    clearAuthState,
  };
};
