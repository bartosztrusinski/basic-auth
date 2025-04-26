'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/alert';
import { resendVerificationEmail } from '@/auth/actions';

export function ResendVerificationForm() {
  const [state, action, isPending] = useActionState(resendVerificationEmail, {
    isSuccess: false,
  });

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

      {state.errors && <Alert variant='error' message={state.errors} />}
      {state.isSuccess && <Alert variant='success' message='Confirmation email has been sent!' />}

      <button disabled={isPending} className='rounded border-2 border-white p-1'>
        {isPending ? 'Sending...' : 'Send Email'}
      </button>
    </form>
  );
}
