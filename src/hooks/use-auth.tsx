'use client';

import { refreshAccessToken } from '@/refresh-access-token';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

type AccessToken = string | null;

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
