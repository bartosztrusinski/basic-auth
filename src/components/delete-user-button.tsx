'use client';

import { useActionState } from 'react';
import { deleteUser } from '@/auth/actions';

export function DeleteUserButton() {
  const [, action, isPending] = useActionState(deleteUser, null);

  return (
    <form action={action}>
      <button
        disabled={isPending}
        className='w-full rounded bg-red-600 p-4 py-2 shadow-lg shadow-red-900 disabled:cursor-not-allowed disabled:opacity-50'
      >
        Delete Account
      </button>
    </form>
  );
}
