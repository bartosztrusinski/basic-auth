'use client';

import { useActionState } from 'react';
import { logOutEverywhere } from '@/auth/actions';

export function LogoutEverywhereButton() {
  const [, action, isPending] = useActionState(logOutEverywhere, null);

  return (
    <form action={action}>
      <button
        disabled={isPending}
        className='rounded bg-red-600 p-4 py-2 shadow-lg shadow-red-900 disabled:cursor-not-allowed disabled:opacity-50'
      >
        Log Out Everywhere
      </button>
    </form>
  );
}
