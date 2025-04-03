'use client';

import { useActionState } from 'react';
import { signUp } from '@/actions';

export function SignupForm() {
  const [state, action, isPending] = useActionState(signUp, {});

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
      {state.errors && (
        <div className='text-sm font-light text-red-500'>
          {state.errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
      <button disabled={isPending} className='rounded border-2 border-white p-1'>
        {isPending ? 'Submitting...' : 'Sign Up'}
      </button>
    </form>
  );
}
