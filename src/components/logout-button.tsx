'use client';

import { useActionState } from 'react';
import { useAuth } from '@/auth/hooks/use-auth';

export function LogoutButton() {
  const { logOut } = useAuth();
  const [, action, isPending] = useActionState(logOut, {});

  return (
    <form action={action}>
      <button disabled={isPending} className='disabled:cursor-not-allowed disabled:text-zinc-400'>
        Log Out
      </button>
    </form>
  );
}
