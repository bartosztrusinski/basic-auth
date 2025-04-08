'use client';

import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';
import { type User } from '@/db';
import { getAuth } from '@/actions';

type Auth = {
  isLoggedIn?: boolean;
  userId?: User['id'];
  userRole?: User['role'];
  expirationTime?: number;
};

type AuthContext = Auth & {
  setAuth: Dispatch<React.SetStateAction<Auth>>;
};

type Props = {
  children: ReactNode;
  initialAuth?: Auth;
};

export const AuthContext = createContext<AuthContext>({
  setAuth: () => null,
});

export function AuthProvider({ children, initialAuth = {} }: Props) {
  const [auth, setAuth] = useState(initialAuth);

  const checkAuth = useCallback(async () => {
    try {
      const auth = await getAuth();
      setAuth(auth);
    } catch {
      setAuth({});
    }
  }, []);

  useEffect(() => {
    if (!auth.expirationTime) {
      return;
    }

    const timeout = setTimeout(() => {
      void checkAuth();
    }, auth.expirationTime - Date.now());

    return () => {
      clearTimeout(timeout);
    };
  }, [auth.expirationTime, checkAuth]);

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

  return <AuthContext.Provider value={{ ...auth, setAuth }}>{children}</AuthContext.Provider>;
}
