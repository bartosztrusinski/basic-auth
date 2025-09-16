'use client';

import { useActionState } from 'react';
import { logOutEverywhere } from '@/actions';

export function LogoutEverywhereForm() {
  const [, action, isPending] = useActionState(logOutEverywhere, null);

  return (
    <form action={action}>
      <button type='submit' disabled={isPending} className='btn btn-inline btn-danger'>
        {isPending ? 'Logging out...' : 'Log Out'}
      </button>
    </form>
  );
}
