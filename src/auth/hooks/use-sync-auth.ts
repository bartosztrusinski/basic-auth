import { useEffect } from 'react';
import { useAuth } from './use-auth';

export function useSyncAuth() {
  const { isLoggedIn, syncAuth } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      const controller = new AbortController();

      void syncAuth(controller.signal);

      return () => {
        controller.abort();
      };
    }
  }, [isLoggedIn, syncAuth]);
}
