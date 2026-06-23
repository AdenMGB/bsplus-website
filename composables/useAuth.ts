type AuthUser = Record<string, any> | null;

interface RefreshResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
}

function readTokenFromForwardHeaders(headers?: Record<string, string>): string | null {
  if (!headers) return null;
  const cookieHeader = headers.cookie || headers.Cookie;
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith('auth_token=')) {
      const value = trimmed.slice('auth_token='.length);
      try {
        return decodeURIComponent(value) || null;
      } catch {
        return value || null;
      }
    }
  }
  return null;
}

export const useAuth = () => {
  const user = useState<AuthUser>('auth_user', () => null);
  const loading = useState<boolean>('auth_loading', () => true);
  const accessToken = useState<string | null>('auth_access_token', () => null);

  const bootstrapAccessToken = (headers?: Record<string, string>) => {
    if (accessToken.value) return accessToken.value;
    if (import.meta.server) {
      const fromHeader = readTokenFromForwardHeaders(headers);
      if (fromHeader) {
        accessToken.value = fromHeader;
        return fromHeader;
      }
    }
    return null;
  };

  const getAuthHeaders = (headers?: Record<string, string>) => {
    const nextHeaders: Record<string, string> = { ...(headers || {}) };
    bootstrapAccessToken(headers);
    if (!nextHeaders.authorization && accessToken.value) {
      nextHeaders.authorization = `Bearer ${accessToken.value}`;
    }
    return nextHeaders;
  };

  const clearAuthState = () => {
    accessToken.value = null;
    user.value = null;
  };

  /**
   * On SSR, `credentials: 'include'` does not forward the browser cookie to the internal
   * `/api/auth/refresh` call — pass `forwardHeaders` from `useRequestHeaders(['cookie'])`.
   */
  const refreshAccessToken = async (forwardHeaders?: Record<string, string>) => {
    const response = await $fetch<RefreshResponse>('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      ...(forwardHeaders && Object.keys(forwardHeaders).length > 0
        ? { headers: forwardHeaders }
        : {}),
    });

    accessToken.value = response.access_token;
    return response;
  };

  const fetchUser = async (headers?: Record<string, string>) => {
    loading.value = true;

    const fetchMe = async () => {
      const data = await $fetch('/api/auth/me', {
        headers: getAuthHeaders(headers),
        credentials: 'include',
      });
      user.value = data;
      return data;
    };

    try {
      bootstrapAccessToken(headers);

      if (accessToken.value) {
        const { isJwtExpired } = await import('~/utils/auth-session');
        if (isJwtExpired(accessToken.value)) {
          await refreshAccessToken(headers);
        }
      }

      try {
        return await fetchMe();
      } catch (error: any) {
        const statusCode = error?.statusCode || error?.response?.status;
        if (statusCode !== 401) {
          throw error;
        }
        await refreshAccessToken(headers);
        return await fetchMe();
      }
    } catch (refreshError: any) {
      const refreshStatus = refreshError?.statusCode || refreshError?.response?.status;
      if (refreshStatus === 401 || refreshStatus === 400) {
        clearAuthState();
        return null;
      }
      throw refreshError;
    } finally {
      loading.value = false;
    }
  };

  const login = (redirectPath?: string) => {
    const path = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
    window.location.href = `/api/auth/login${path}`;
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
