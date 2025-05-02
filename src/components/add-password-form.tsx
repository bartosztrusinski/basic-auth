'use client';

import { useActionState, useState } from 'react';
import { type User } from '@/db';
import { addPassword } from '@/auth/actions';
import { Alert } from '@/components/alert';
import { usePathname } from 'next/navigation';

type Props = {
  email: User['email'];
};

export function AddPasswordForm({ email }: Props) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const pathname = usePathname();
  const [state, action, isPending] = useActionState(addPassword.bind(null, pathname), {
    isSuccess: false,
  });

  if (!isFormVisible) {
    return (
      <button
        onClick={() => setIsFormVisible(true)}
        className='w-full rounded border border-zinc-500 p-2'
      >
        Add Password
      </button>
    );
  }

  return (
    <form action={action} className='flex flex-col gap-3'>
      <input
        type='email'
        id='email'
        name='email'
        required
        placeholder='Email'
        autoComplete='email'
        className='hidden'
        defaultValue={email}
      />
      <input
        type='password'
        id='password'
        name='password'
        required
        placeholder='Password'
        autoComplete='new-password'
        className='rounded bg-white px-2 py-1 text-base text-black'
      />
      <input
        type='password'
        id='confirmPassword'
        name='confirmPassword'
        required
        placeholder='Confirm Password'
        autoComplete='new-password'
        className='rounded bg-white px-2 py-1 text-base text-black'
      />

      {state.errors && <Alert variant='error' message={state.errors} />}

      <div className='flex gap-2'>
        <button
          type='submit'
          disabled={isPending}
          className='w-full rounded border border-zinc-500 p-2'
        >
          {isPending ? 'Submitting...' : 'Set Password'}
        </button>
        <button
          type='button'
          onClick={() => setIsFormVisible(false)}
          className='w-10 shrink-0 rounded border border-zinc-500 p-2'
        >
          ⨉
        </button>
      </div>
    </form>
  );
}
