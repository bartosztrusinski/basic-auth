'use client';

import { type FormEvent, useState, useTransition } from 'react';
import { logIn } from '@/actions';
import { useAuth } from '@/hooks/use-auth';

export function LoginForm() {
  const [error, setError] = useState<string | null>();
  const [isPending, startTransition] = useTransition();
  const { setAccessToken } = useAuth();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;

    startTransition(async () => {
      try {
        const { error, accessToken } = await logIn(null, new FormData(form));

        if (error) {
          throw new Error(error);
        }

        setAccessToken(accessToken!);
      } catch {
        setError('Failed to log in. Please try again.');
        form.reset();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
      <input
        type='email'
        name='email'
        required
        placeholder='Email'
        className='rounded bg-white px-2 py-1 text-base text-black'
      />
      <input
        type='password'
        name='password'
        required
        placeholder='********'
        className='rounded bg-white px-2 py-1 text-base text-black'
      />
      <p className='min-h-6 text-red-500'>{error && error}</p>
      <button disabled={isPending} className='rounded border-2 border-white p-1'>
        {isPending ? 'Submitting...' : 'Log In'}
      </button>
    </form>
  );
}
