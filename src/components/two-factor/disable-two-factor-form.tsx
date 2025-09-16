'use client';

import { useActionState, useTransition, type FormEvent } from 'react';
import { toast } from 'sonner';
import { getAuthMessage } from '@/auth/message';
import { disableTwoFactorAuth } from '@/actions';

export function DisableTwoFactorForm() {
  const [, action, isActionPending] = useActionState(disableTwoFactorAuth, null);
  const [isTransitionPending, startTransition] = useTransition();
  const isPending = isTransitionPending || isActionPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const { isSuccess, errors } = await disableTwoFactorAuth();

      if (errors && errors.length > 0) {
        toast.error(errors);
      }

      if (isSuccess) {
        const { message } = getAuthMessage('two-factor-disabled');
        toast.success(message);
      }
    });
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <button type='submit' disabled={isPending} className='btn btn-inline btn-danger'>
        {isPending ? 'Disabling...' : 'Disable'}
      </button>
    </form>
  );
}
