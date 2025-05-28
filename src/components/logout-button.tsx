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
        className='btn py-0 font-normal shadow-none transition-none hover:scale-100'
      >
        Log Out
      </button>
    </form>
  );
}
