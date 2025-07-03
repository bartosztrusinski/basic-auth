'use client';

import { useActionState, useId } from 'react';
import Link from 'next/link';
import { signUp } from '@/auth/actions/session';
import config from '@/auth/config';
import { Alert } from '@/components/ui/alert';
import { AuthAlert } from '@/components/auth-alert';

export function SignupForm() {
  const id = useId();
  const [state, action, isPending] = useActionState(signUp, {
    isSuccess: false,
    errors: '',
  });

  return (
    <>
      <form action={action}>
        <div className='space-y-3'>
          <div className='flex flex-col'>
            <label htmlFor={`${id}-email`}>Email</label>
            <input
              id={`${id}-email`}
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
          <div className='flex flex-col'>
            <label htmlFor={`${id}-name`}>Name</label>
            <input
              id={`${id}-name`}
              name='name'
              placeholder='John Doe'
              autoComplete='name'
              required
              className='form-control'
              defaultValue={state.isSuccess ? undefined : state.fields?.name}
            />
          </div>
          <div className='flex flex-col'>
            <label htmlFor={`${id}-password`}>Password</label>
            <input
              id={`${id}-password`}
              name='password'
              type='password'
              placeholder='********'
              autoComplete='new-password'
              required
              className='form-control'
            />
          </div>

          {state.errors && <Alert variant='error' message={state.errors} />}
          {state.isSuccess && <AuthAlert authCode='verification-email-sent' />}
        </div>

        <button type='submit' disabled={isPending} className='btn mt-5'>
          {isPending ? 'Submitting...' : 'Sign Up'}
        </button>
      </form>
      <div className='text-neutral-400'>
        <p>
          Already have an account?{' '}
          <Link href={config.loginRoute} className='link'>
            Log in
          </Link>
        </p>
        <p>
          Didn&apos;t get verification email?{' '}
          <Link href='/resend-email' className='link'>
            Resend email
          </Link>
        </p>
      </div>
    </>
  );
}
