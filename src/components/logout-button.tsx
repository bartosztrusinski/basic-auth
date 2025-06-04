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
        className='link text-inherit hover:text-primary-500 hover:no-underline disabled:cursor-not-allowed disabled:opacity-75'
      >
        Log Out
      </button>
    </form>
  );
}
