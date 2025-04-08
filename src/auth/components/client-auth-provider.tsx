'use client';

import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { type User } from '@/db';
import { logOut as logOutAction, logIn as logInAction } from '@/actions';
import config from '../config';

type Auth = {
  isLoggedIn?: boolean;
  userId?: User['id'];
  userRole?: User['role'];
  expirationTime?: number;
};

type AuthContext = Auth & {
  syncAuth: () => Promise<void>;
  logIn: typeof logInAction;
  logOut: typeof logOutAction;
};

type Props = {
  children: ReactNode;
  initialAuth?: Auth;
};

export const AuthContext = createContext<AuthContext>({
  syncAuth: async () => undefined,
  logIn: logInAction,
  logOut: logOutAction,
});

export function ClientAuthProvider({ children, initialAuth = {} }: Props) {
  const [auth, setAuth] = useState(initialAuth);
  const router = useRouter();

  const syncAuth = useCallback(async () => {
    const response = await fetch(config.apiRoute, {
      cache: 'no-store',
    });

    const auth = (await response.json()) as Auth;

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

  async function logOut() {
    const state = await logOutAction({});
    setAuth({ isLoggedIn: false });

    return state;
  }

  async function logIn(_: unknown, formData: FormData) {
    const { errors, session, success } = await logInAction({}, formData);

    if (success) {
      setAuth({ ...session, isLoggedIn: true });
    }

    return {
      errors,
      success,
    };
  }
  return (
    <AuthContext.Provider value={{ ...auth, syncAuth, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
