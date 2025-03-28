'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { refreshAccessToken } from '@/refresh-access-token';

type AccessToken = string | null;

export type ExtendedRequestInit = RequestInit & {
  _shouldRetry?: boolean;
};

const AuthContext = createContext<{
  accessToken: AccessToken;
  setAccessToken: Dispatch<SetStateAction<string | null>>;
}>({
  accessToken: null,
  setAccessToken: () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<AccessToken>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (resource, config) => {
      // REQUEST INTERCEPTOR
      const authHeaders = new Headers(config?.headers);

      if (!authHeaders.get('Authorization')) {
        authHeaders.set('Authorization', `Bearer ${accessToken}`);
      }

      // FETCH
      const response = await originalFetch(resource, {
        ...config,
        headers: authHeaders,
      });

      // RESPONSE INTERCEPTOR
      const shouldRetry = (config as ExtendedRequestInit)?._shouldRetry ?? true;

      if ([401, 403].includes(response.status) && shouldRetry) {
        const newAccessToken = await refreshAccessToken();
        setAccessToken(newAccessToken);

        const retryHeaders = new Headers(config?.headers);
        retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);

        const retryResponse = await originalFetch(resource, {
          ...config,
          headers: retryHeaders,
        });

        if (!retryResponse.ok) {
          setAccessToken(null);
        }

        return retryResponse;
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [accessToken]);

  useEffect(() => {
    const getNewToken = async () => {
      try {
        const newToken = await refreshAccessToken();
        setAccessToken(newToken);
      } catch {
        console.error('Failed to refresh token');
      } finally {
        setIsInitializing(false);
      }
    };

    void getNewToken();
  }, []);

  if (isInitializing) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
