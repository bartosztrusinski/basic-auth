'use client';

import { type FormEvent, useTransition } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { publicAxios } from '@/axios';

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const { setAccessToken } = useAuth();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      await publicAxios.post('/api/auth/logout');
      setAccessToken(null);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <button disabled={isPending}>{isPending ? 'Logging Out...' : 'Log Out'}</button>
    </form>
  );
}
