'use client';

import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';
import { usePathname } from 'next/navigation';
import { type User } from '@/db';
import { getAuth } from '@/actions';

type Auth = {
  isLoggedIn?: boolean;
  userId?: User['id'];
  userRole?: User['role'];
  expirationTime?: number;
};

type AuthContext = Auth & {
  isLoading: boolean;
  setAuth: Dispatch<React.SetStateAction<Auth>>;
};

type Props = {
  children: ReactNode;
  initialAuth?: Auth;
};

export const AuthContext = createContext<AuthContext>({ isLoading: true, setAuth: () => null });

export function AuthProvider({ children, initialAuth = {} }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [auth, setAuth] = useState(initialAuth);
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const auth = await getAuth();
      setAuth(auth);
    } catch {
      setAuth({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.expirationTime && Date.now() > auth.expirationTime) {
      void checkAuth();
    }
  }, [auth.expirationTime, checkAuth, pathname]);

  useEffect(() => {
    const controller = new AbortController();

    document.addEventListener(
      'visibilitychange',
      () => {
        if (!document.hidden && auth.isLoggedIn) {
          void checkAuth();
        }
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
    };
  }, [auth.isLoggedIn, checkAuth]);

  return (
    <AuthContext.Provider value={{ ...auth, isLoading, setAuth }}>{children}</AuthContext.Provider>
  );
}
