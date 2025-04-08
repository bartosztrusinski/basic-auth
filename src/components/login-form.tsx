'use client';

import { type FormEvent, useState, useTransition } from 'react';
import { logIn } from '@/actions';
import { useAuth } from '@/auth/hooks/use-auth';

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);
  const { setAuth } = useAuth();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);

    event.preventDefault();

    startTransition(async () => {
      const { errors, session, success } = await logIn(formData);

      if (success) {
        setAuth({ ...session, isLoggedIn: true });
      }

      if (errors) {
        setErrors(errors);
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
      {errors && (
        <div className='text-sm font-light text-red-500'>
          {errors.map((error, index) => (
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
