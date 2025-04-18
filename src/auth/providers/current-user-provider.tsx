'use client';

import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from '../hooks/use-auth';
import { fetcher, isSameObject } from '../util';
import { type BackendUser } from '../session';
import config from '../config';

type CurrentUser = Omit<BackendUser, 'role'>;

type UserData =
  | {
      isLoggedIn: true;
      currentUser: CurrentUser & { reload: () => Promise<void> };
    }
  | {
      isLoggedIn: false;
      currentUser: null;
    };

type CurrentUserContext = UserData & {
  isLoading: boolean;
};

type Props = {
  children: ReactNode;
  initialUser?: CurrentUser | null;
};

export const CurrentUserContext = createContext<CurrentUserContext>({
  isLoggedIn: false,
  isLoading: false,
  currentUser: null,
});

export function CurrentUserProvider({ children, initialUser = null }: Props) {
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(Boolean(isLoggedIn && !initialUser));
  const [currentUser, setCurrentUser] = useState(initialUser);

  const fetchUser = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const user = await fetcher<CurrentUser | null>(
          `${config.apiBaseRoute}/${config.apiUserEndpoint}`,
          { signal },
        );

        if (!currentUser || !user || !isSameObject(currentUser, user)) {
          setCurrentUser(user);
        }
      } catch (error) {
        if (signal?.aborted) {
          console.info('User fetch aborted');
        } else {
          console.error('User fetch failed:', error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser],
  );

  const userData: UserData = currentUser
    ? { isLoggedIn: true, currentUser: { ...currentUser, reload: fetchUser } }
    : { isLoggedIn: false, currentUser: null };

  // This effect synchronizes the current user state with the auth state
  useEffect(() => {
    if (isLoggedIn && !currentUser) {
      setIsLoading(true);

      const controller = new AbortController();

      void fetchUser(controller.signal);

      return () => {
        controller.abort();
      };
    }

    if (!isLoggedIn && currentUser) {
      setCurrentUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    <CurrentUserContext.Provider value={{ isLoading, ...userData }}>
      {children}
    </CurrentUserContext.Provider>
  );
}
