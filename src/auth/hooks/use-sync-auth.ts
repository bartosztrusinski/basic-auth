import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from './use-auth';
import config from '../config';

export function useSyncAuth() {
  const { syncAuth } = useAuth();
  const searchParams = useSearchParams();
  const returnBackUrl = searchParams.get(config.returnBackUrlKey);

  useEffect(() => {
    if (returnBackUrl) {
      const controller = new AbortController();

      void syncAuth(controller.signal);
      return () => {
        controller.abort();
      };
    }
  }, [returnBackUrl, syncAuth]);
}
