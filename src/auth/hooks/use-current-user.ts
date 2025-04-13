import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { fetcher } from '../util';
import { type BackendUser } from '../session';
import config from '../config';

type CurrentUser = Omit<BackendUser, 'role'>;

type UserData =
  | {
      isLoggedIn: true;
      user: CurrentUser;
    }
  | {
      isLoggedIn: false;
      user: null;
    };

type UseCurrentUser = UserData & {
  isLoading: boolean;
};

export function useCurrentUser(): UseCurrentUser {
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(isLoggedIn);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(true);

      const controller = new AbortController();

      async function fetchUser() {
        try {
          const user = await fetcher<CurrentUser>(config.apiUserEndpoint, {
            signal: controller.signal,
          });

          setUser(user);
        } catch (error) {
          if (controller.signal?.aborted) {
            console.info('User fetch aborted');
          } else {
            console.error('User fetch failed:', error);
          }
        } finally {
          setIsLoading(false);
        }
      }

      void fetchUser();

      return () => {
        controller.abort();
      };
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  if (isLoggedIn && user) {
    return {
      isLoggedIn: true,
      isLoading,
      user,
    };
  }

  return {
    isLoggedIn: false,
    isLoading,
    user: null,
  };
}
