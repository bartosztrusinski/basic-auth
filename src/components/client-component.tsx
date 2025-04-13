'use client';

import { useCurrentUser } from '@/auth/hooks/use-current-user';
import { useSyncAuth } from '@/auth/hooks/use-sync-auth';

export function ClientComponent() {
  const { isLoading, isLoggedIn, user } = useCurrentUser();

  useSyncAuth();

  if (isLoading) {
    return null;
  }

  return (
    <span className='mt-1 block'>
      Client-side: {isLoggedIn ? `Welcome back ${user.name}` : 'You are not logged in'}
    </span>
  );
}
