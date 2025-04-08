'use client';

import { useActionState } from 'react';
import { useAuth } from '@/auth/hooks/use-auth';

export function LoginForm() {
  const { logIn } = useAuth();
  const [state, action, isPending] = useActionState(logIn, {});

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
      {state.errors && (
        <div className='text-sm font-light text-red-500'>
          {state.errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
      <button disabled={isPending} className='rounded border-2 border-white p-1'>
        {isPending ? 'Submitting...' : 'Log In'}
      </button>
    </form>
  );
}
