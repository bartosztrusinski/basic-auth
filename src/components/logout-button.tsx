'use client';

import { useActionState } from 'react';
import { logOut } from '@/actions';

export function LogoutButton() {
  const [state, action, isPending] = useActionState(logOut, null);

  console.log(state?.error);

  return (
    <form action={action}>
      <button disabled={isPending}>{isPending ? 'Logging Out...' : 'Log Out'}</button>
    </form>
  );
}
