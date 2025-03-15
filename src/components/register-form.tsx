'use client';

import { useActionState } from 'react';
import { register } from '@/actions';

export function RegisterForm() {
  const [state, action, isPending] = useActionState(register, null);

  return (
    <form action={action} className='flex flex-col gap-3'>
      <input
        type='email'
        name='email'
        required
        placeholder='Email'
        className='rounded bg-white px-2 py-1 text-base text-black'
      />
      <input
        name='name'
        required
        placeholder='Name'
        className='rounded bg-white px-2 py-1 text-base text-black'
      />
      <input
        type='password'
        name='password'
        required
        placeholder='********'
        className='rounded bg-white px-2 py-1 text-base text-black'
      />
      <p className='min-h-6 text-red-500'> {state?.error && state.error}</p>
      <button disabled={isPending} className='rounded border-2 border-white p-1'>
        {isPending ? 'Submitting...' : 'Sign Up'}
      </button>
    </form>
  );
}
