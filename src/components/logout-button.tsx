'use client';

import { useActionState } from 'react';
import { logOut } from '@/auth/actions';

export function LogoutButton() {
  const [, action, isPending] = useActionState(logOut, null);

  return (
    <form action={action}>
      <button disabled={isPending} className='disabled:cursor-not-allowed disabled:text-zinc-400'>
        Log Out
      </button>
    </form>
  );
}
