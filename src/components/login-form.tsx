'use client';

import { useActionState } from 'react';
import { logIn, oAuthLogIn } from '@/auth/actions';

export function LoginForm() {
  const [state, action, isPending] = useActionState(logIn, { isSuccess: false });

  return (
    <>
      <div className='grid grid-flow-col gap-2'>
        <form action={oAuthLogIn.bind(null, 'discord')}>
          <button className='w-full rounded bg-zinc-800 p-2 font-bold shadow-lg'>Discord</button>
        </form>
        <form action={oAuthLogIn.bind(null, 'github')}>
          <button className='w-full rounded bg-zinc-800 p-2 font-bold shadow-lg'>GitHub</button>
        </form>
      </div>
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
    </>
  );
}
