'use client';

import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { type User } from '@/db';
import config from '../config';

type Auth = {
  isLoggedIn?: boolean;
  userId?: User['id'];
  userRole?: User['role'];
  expirationTime?: number;
};

type AuthContext = Auth & {
  syncAuth: (signal?: AbortSignal) => Promise<void>;
};

type Props = {
  children: ReactNode;
  initialAuth?: Auth;
};

export const AuthContext = createContext<AuthContext>({
  syncAuth: async () => undefined,
});

export function ClientAuthProvider({ children, initialAuth = {} }: Props) {
  const [auth, setAuth] = useState(initialAuth);
  const router = useRouter();

  const syncAuth = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(config.apiRoute, {
        cache: 'no-store',
        signal,
      });

      const auth = (await response.json()) as Auth;

      setAuth(auth);
    } catch (error) {
      if (signal?.aborted) {
        console.info('Auth sync aborted');
      } else {
        console.error('Auth sync failed:', error);
      }
    }
  }, []);

  // This effect is for syncing auth when it expires
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

  // This effect is for syncing auth when the page becomes visible again
  useEffect(() => {
    const controller = new AbortController();

    document.addEventListener(
      'visibilitychange',
      () => {
        if (!document.hidden && auth.isLoggedIn) {
          void syncAuth(controller.signal);
          router.refresh();
        }
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
    };
  }, [auth.isLoggedIn, syncAuth, router]);

  // This effect is for syncing auth when it is requested by the server
  useEffect(() => {
    const originalFetch = window.fetch;
    const controller = new AbortController();

    window.fetch = async (...args) => {
      const [resource, requestConfig] = args;

      const response = await originalFetch(resource, requestConfig);

      if (document.cookie.includes(`${config.syncAuthCookieKey}=true`)) {
        document.cookie = `${config.syncAuthCookieKey}=false; max-age=0; path=/`;
        await syncAuth(controller.signal);
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
      controller.abort();
    };
  }, [syncAuth]);

  return <AuthContext.Provider value={{ ...auth, syncAuth }}>{children}</AuthContext.Provider>;
}
