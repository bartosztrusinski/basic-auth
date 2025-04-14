'use client';

import { useCurrentUser } from '@/auth/hooks/use-current-user';
import { useSyncAuth } from '@/auth/hooks/use-sync-auth';

export function ClientComponent() {
  const { isLoading, isLoggedIn, currentUser } = useCurrentUser();

  // Sync auth state in public route for layout client components as they do not re-render
  useSyncAuth();

  if (isLoading) {
    return null;
  }

  return (
    <span className='mt-1 block'>
      Client-side: {isLoggedIn ? `Welcome back ${currentUser.name}` : 'You are not logged in'}
    </span>
  );
}
