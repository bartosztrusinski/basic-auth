'use client';

import { useActionState } from 'react';
import { signUp } from '@/actions';
import { Alert } from '@/components/alert';
import { AuthAlert } from '@/components/auth-alert';

export function SignupForm() {
  const [state, action, isPending] = useActionState(signUp, { isSuccess: false });

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
        name='name'
        required
        placeholder='Name'
        autoComplete='name'
        className='rounded bg-white px-2 py-1 text-base text-black'
      />
      <input
        type='password'
        name='password'
        required
        placeholder='********'
        autoComplete='new-password'
        className='rounded bg-white px-2 py-1 text-base text-black'
      />

      {state.errors && <Alert variant='error' message={state.errors} />}
      {state.isSuccess && <AuthAlert authCode='verification-email-sent' />}

      <button disabled={isPending} className='rounded border-2 border-white p-1'>
        {isPending ? 'Submitting...' : 'Sign Up'}
      </button>
    </form>
  );
}
