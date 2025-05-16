'use client';

import { type FormEvent, useActionState, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { type User } from '@/db';
import { addPassword } from '@/actions';
import { Alert } from '@/components/alert';
import { ClassyDialog } from '@/components/classy-dialog';
import { getAuthMessage } from '@/auth/message';

type Props = {
  email: User['email'];
};

export function AddPasswordForm({ email }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<string | string[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [state, action, isActionPending] = useActionState(addPassword, { isSuccess: false });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);

    event.preventDefault();
    setErrors(null);

    startTransition(async () => {
      const { isSuccess, errors } = await addPassword(null, formData);

      if (isSuccess) {
        const { message } = getAuthMessage('password-set');
        toast.success(message);
        formRef.current?.reset();
      }

      if (errors) {
        setErrors(errors);
      }
    });
  }

  function handleClose() {
    setErrors(null);
    formRef.current?.reset();
  }

  return (
    <ClassyDialog
      trigger={<button className='w-full rounded border border-zinc-500 p-2'>Add Password</button>}
      onClose={handleClose}
      heading='Set Password'
      description='After setting a password, you will be able to log in with your email and password.'
    >
      <form ref={formRef} action={action} onSubmit={handleSubmit} className='flex flex-col gap-3'>
        <input
          type='email'
          id='email'
          name='email'
          required
          autoFocus
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
        {state.errors && (
          <noscript>
            <p className='rounded border border-red-900 bg-red-950 p-2 text-sm text-red-400'>
              {state.errors}
            </p>
          </noscript>
        )}

        <button
          type='submit'
          disabled={isPending || isActionPending}
          className='rounded border border-zinc-500 p-2'
        >
          {isPending || isActionPending ? 'Submitting...' : 'Set Password'}
        </button>
      </form>
    </ClassyDialog>
  );
}
