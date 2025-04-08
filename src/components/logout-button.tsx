'use client';

import { logOut } from '@/actions';
import { useAuth } from '@/auth/hooks/use-auth';
import { useActionState, useEffect } from 'react';

export function LogoutButton() {
  const [state, action, isPending] = useActionState(logOut, {});
  const { setAuth } = useAuth();

  useEffect(() => {
    if (state.success) {
      setAuth({ isLoggedIn: false });
    }
  }, [setAuth, state]);

  return (
    <form action={action}>
      <button disabled={isPending} className='disabled:cursor-not-allowed disabled:text-zinc-400'>
        Log Out
      </button>
    </form>
  );
}
