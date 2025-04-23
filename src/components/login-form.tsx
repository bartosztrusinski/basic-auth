'use client';

import { useActionState } from 'react';
import { logIn } from '@/auth/actions';
import { Alert } from '@/components/alert';

export function LoginForm() {
  const [state, action, isPending] = useActionState(logIn, { isSuccess: false });

  return (
    <form action={action} className='flex flex-col gap-5'>
      <input
        type='email'
        name='email'
        required
        placeholder='Email'
        autoComplete='email'
        className='rounded bg-white px-2 py-1 text-base text-black'
      />
      <input
        type='password'
        name='password'
        required
        placeholder='********'
        autoComplete='current-password'
        className='rounded bg-white px-2 py-1 text-base text-black'
      />

      {state.errors && <Alert variant='error' message={state.errors} />}

      <button disabled={isPending} className='rounded border-2 border-white p-1'>
        {isPending ? 'Submitting...' : 'Log In'}
      </button>
    </form>
  );
}
