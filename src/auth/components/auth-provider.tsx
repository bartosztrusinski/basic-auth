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
import { useRouter } from 'next/navigation';

type Auth = {
  isLoggedIn?: boolean;
  userId?: User['id'];
  userRole?: User['role'];
  expirationTime?: number;
};

type AuthContext = Auth & {
  setAuth: Dispatch<React.SetStateAction<Auth>>;
  syncAuth: () => Promise<void>;
};

type Props = {
  children: ReactNode;
  initialAuth?: Auth;
};

export const AuthContext = createContext<AuthContext>({
  setAuth: () => null,
  syncAuth: async () => undefined,
});

export function AuthProvider({ children, initialAuth = {} }: Props) {
  const [auth, setAuth] = useState(initialAuth);
  const router = useRouter();

  const syncAuth = useCallback(async () => {
    const auth = await getAuth();

    setAuth(auth);
  }, []);

  useEffect(() => {
    if (!auth.expirationTime || !auth.isLoggedIn) {
      return;
    }

    const timeout = setTimeout(() => {
      void syncAuth();
      router.refresh();
    }, auth.expirationTime - Date.now());

    return () => {
      clearTimeout(timeout);
    };
  }, [auth.expirationTime, auth.isLoggedIn, syncAuth, router]);

  useEffect(() => {
    const controller = new AbortController();

    document.addEventListener(
      'visibilitychange',
      () => {
        if (!document.hidden && auth.isLoggedIn) {
          void syncAuth();
          router.refresh();
        }
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
    };
  }, [auth.isLoggedIn, syncAuth, router]);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, syncAuth }}>{children}</AuthContext.Provider>
  );
}
