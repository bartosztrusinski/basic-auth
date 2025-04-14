'use client';

import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { type User } from '@/db';
import { fetcher } from '../util';
import config from '../config';

type Auth = {
  isLoggedIn: boolean;
  userId?: User['id'];
  userRole?: User['role'];
  expirationTime?: number;
};

type SessionContext = Auth & {
  syncAuth: (signal?: AbortSignal) => Promise<void>;
};

type Props = {
  children: ReactNode;
  initialAuth?: Auth;
};

export const SessionContext = createContext<SessionContext>({
  isLoggedIn: false,
  syncAuth: async () => undefined,
});

export function SessionProvider({ children, initialAuth = { isLoggedIn: false } }: Props) {
  const [auth, setAuth] = useState<Auth>(initialAuth);
  const router = useRouter();

  const syncAuth = useCallback(async (signal?: AbortSignal) => {
    try {
      const auth = await fetcher<Auth>(`${config.apiBaseRoute}/${config.apiSessionEndpoint}`, {
        cache: 'no-store',
        signal,
      });

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

  return (
    <SessionContext.Provider value={{ ...auth, syncAuth }}>{children}</SessionContext.Provider>
  );
}
