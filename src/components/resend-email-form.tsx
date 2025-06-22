'use client';

import { useActionState, useId } from 'react';
import { resendVerificationEmail } from '@/auth/actions/email';
import { Alert } from '@/components/ui/alert';
import { AuthAlert } from '@/components/auth-alert';

export function ResendEmailForm() {
  const id = useId();
  const [state, action, isPending] = useActionState(resendVerificationEmail, {
    isSuccess: false,
    errors: '',
  });

  return (
    <form action={action}>
      <div className='space-y-3'>
        <div className='flex flex-col'>
          <label htmlFor={id}>Email</label>
          <input
            id={id}
            name='email'
            type='email'
            placeholder='john@doe.com'
            autoComplete='email'
            required
            autoFocus
            className='form-control'
            defaultValue={state.isSuccess ? undefined : state.fields?.email}
          />
        </div>

        {state.errors && <Alert variant='error' message={state.errors} />}
        {state.isSuccess && <AuthAlert authCode='verification-email-sent' />}
      </div>

      <button type='submit' disabled={isPending} className='btn mt-5'>
        {isPending ? 'Sending...' : 'Send Email'}
      </button>
    </form>
  );
}
