'use client';

import { useActionState, useEffect } from 'react';
import { logIn } from '@/auth/actions';
import { Alert } from '@/components/alert';

type Props = {
  onSuccess?: (data: Awaited<ReturnType<typeof logIn>>['data']) => void;
};

export function CredentialsForm({ onSuccess }: Props) {
  const [state, action, isPending] = useActionState(logIn, {
    isSuccess: false,
    errors: '',
  });

  useEffect(() => {
    if (state.isSuccess) {
      onSuccess?.(state.data);
    }
  }, [state, onSuccess]);

  return (
    <form action={action} className='flex flex-col gap-4'>
      <input
        type='email'
        name='email'
        required
        autoFocus
        placeholder='Email'
        autoComplete='email'
        className='rounded-sm bg-white px-2 py-1 text-base text-black'
        defaultValue={!state.isSuccess ? state.fields?.email : undefined}
      />
      <input
        type='password'
        name='password'
        required
        placeholder='********'
        autoComplete='current-password'
        className='rounded-sm bg-white px-2 py-1 text-base text-black'
      />

      {state.errors && <Alert variant='error' message={state.errors} />}

      <button
        disabled={isPending}
        className='mt-2 rounded bg-zinc-800 p-2 font-bold shadow outline-current focus-visible:outline-2'
      >
        {isPending ? 'Logging In...' : 'Log In'}
      </button>
    </form>
  );
}
