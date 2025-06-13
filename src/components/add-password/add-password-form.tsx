'use client';

import { type FormEvent, useActionState, useId, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { type User } from '@/db/user';
import { getAuthMessage } from '@/auth/message';
import { addPassword } from '@/actions';
import { Alert } from '@/components/ui/alert';

type Props = {
  email: User['email'];
};

export function AddPasswordForm({ email }: Props) {
  const id = useId();
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

      formRef.current?.reset();

      if (isSuccess) {
        const { message } = getAuthMessage('password-set');
        toast.success(message);
      }

      if (errors) {
        setErrors(errors);
      }
    });
  }

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit}>
      <input name='email' type='hidden' className='hidden' defaultValue={email} />

      <div className='space-y-3'>
        <div className='flex flex-col'>
          <label htmlFor={`${id}-password`}>Password</label>
          <input
            id={`${id}-password`}
            name='password'
            type='password'
            placeholder='********'
            autoComplete='new-password'
            required
            autoFocus
            className='form-control'
          />
        </div>
        <div className='flex flex-col'>
          <label htmlFor={`${id}-confirmPassword`}>Confirm Password</label>
          <input
            id={`${id}-confirmPassword`}
            name='confirmPassword'
            type='password'
            placeholder='********'
            autoComplete='new-password'
            required
            className='form-control'
          />
        </div>

        <Alert variant='error' message={errors ?? state.errors ?? []} />
      </div>
      <button type='submit' disabled={isPending || isActionPending} className='btn mt-5'>
        {isPending || isActionPending ? 'Submitting...' : 'Set Password'}
      </button>
    </form>
  );
}
