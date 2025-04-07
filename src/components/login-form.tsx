'use client';

import { type FormEvent, useActionState, useTransition } from 'react';
import { logIn } from '@/actions';
import { useAuth } from '@/auth/hooks/use-auth';

export function LoginForm() {
  const [state] = useActionState(logIn, {});
  const [isPending, startTransition] = useTransition();
  const { setAuth } = useAuth();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const state = await logIn({}, formData);

      if (state.success) {
        setAuth({
          ...state.session,
          isLoggedIn: true,
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
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
