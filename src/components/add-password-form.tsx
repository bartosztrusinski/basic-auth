'use client';

import { type FormEvent, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { type User } from '@/db';
import { addPassword } from '@/actions';
import { Alert } from '@/components/alert';
import { getAuthMessage } from '@/auth/message';

type Props = {
  email: User['email'];
};

// TODO dialog
export function AddPasswordForm({ email }: Props) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<string | string[] | null>(null);

  function openForm() {
    setIsFormVisible(true);
  }

  function closeForm() {
    setIsFormVisible(false);
    setErrors(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);

    event.preventDefault();
    setErrors(null);

    startTransition(async () => {
      const { isSuccess, errors } = await addPassword(formData);

      if (isSuccess) {
        const { message } = getAuthMessage('password-set');
        toast.success(message);
      }

      if (errors) {
        setErrors(errors);
      }
    });
  }

  if (!isFormVisible) {
    return (
      <button onClick={openForm} className='w-full rounded border border-zinc-500 p-2'>
        Add Password
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
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

      {errors && <Alert variant='error' message={errors} />}

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
          onClick={closeForm}
          className='w-10 shrink-0 rounded border border-zinc-500 p-2'
        >
          ⨉
        </button>
      </div>
    </form>
  );
}
