import { useEffect } from 'react';
import { useAuth } from './use-auth';

export function useSyncAuth() {
  const { syncAuth } = useAuth();

  useEffect(() => {
    const controller = new AbortController();

    void syncAuth(controller.signal);

    return () => {
      controller.abort();
    };
  }, [syncAuth]);
}
