'use client';

import { useAuth } from '@/auth/hooks/use-auth';
import { useSyncAuth } from '@/auth/hooks/use-sync-auth';

export function ClientComponent() {
  const { isLoggedIn } = useAuth();

  useSyncAuth();

  return (
    <span className='mt-1 block'>
      Client-side: {isLoggedIn ? 'You are logged in' : 'You are not logged in'}
    </span>
  );
}
