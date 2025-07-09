'use client';

import { type FormEvent, useTransition } from 'react';
import { useAuth } from '@/hooks/use-auth';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const { setAccessToken } = useAuth();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      setAccessToken(null);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <button disabled={isPending}>{isPending ? 'Logging Out...' : 'Log Out'}</button>
    </form>
  );
}
