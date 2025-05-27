'use client';

import { useActionState } from 'react';
import { logOut } from '@/actions';

export function LogoutButton() {
  const [, action, isPending] = useActionState(logOut, null);

  return (
    <form action={action}>
      <button
        type='submit'
        disabled={isPending}
        className='disabled:cursor-not-allowed disabled:opacity-50'
      >
        Log Out
      </button>
    </form>
  );
}
