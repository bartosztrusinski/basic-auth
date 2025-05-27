'use client';

import { useActionState, useEffect, useId } from 'react';
import { logIn } from '@/auth/actions';
import { Alert } from '@/components/alert';

type Props = {
  onSuccess?: (data: Awaited<ReturnType<typeof logIn>>['data']) => void;
};

export function CredentialsForm({ onSuccess }: Props) {
  const id = useId();
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
            className='rounded-sm bg-white px-2 py-1 text-base text-black'
            defaultValue={state.isSuccess ? undefined : state.fields?.email}
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor={`${id}-password`}>Password</label>
          <input
            id={`${id}-password`}
            name='password'
            type='password'
            placeholder='********'
            autoComplete='current-password'
            required
            className='rounded-sm bg-white px-2 py-1 text-base text-black'
          />
        </div>

        {state.errors && <Alert variant='error' message={state.errors} />}
      </div>

      <button
        type='submit'
        disabled={isPending}
        className='mt-5 w-full rounded bg-zinc-800 p-2 font-bold shadow outline-current focus-visible:outline-2'
      >
        {isPending ? 'Logging In...' : 'Log In'}
      </button>
    </form>
  );
}
