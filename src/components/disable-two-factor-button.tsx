'use client';

import { type FormEvent, useActionState, useTransition } from 'react';
import { toast } from 'sonner';
import { getAuthMessage } from '@/auth/message';
import { disableTwoFactorAuth } from '@/actions';
import { ClassyDialog } from '@/components/classy-dialog';

export function DisableTwoFactorButton() {
  const [, action, isActionPending] = useActionState(disableTwoFactorAuth, null);
  const [isPending, startTransition] = useTransition();

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
    <ClassyDialog
      trigger={
        <button className='w-full rounded bg-red-600 p-4 py-2 shadow-lg shadow-red-900 disabled:cursor-not-allowed disabled:opacity-50'>
          Disable Two-Factor Authentication
        </button>
      }
      heading='Disable Two-Factor Authentication'
      description='This action will disable two-factor authentication for your account.'
    >
      {(closeDialog) => (
        <form action={action} onSubmit={handleSubmit} className='flex items-end justify-end gap-2'>
          <button
            type='submit'
            disabled={isPending || isActionPending}
            className='rounded bg-red-600 p-4 py-1 text-sm shadow disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isPending || isActionPending ? 'Disabling...' : 'Disable'}
          </button>
          <button
            type='button'
            onClick={closeDialog}
            className='rounded border border-zinc-700 p-4 py-1 text-sm shadow disabled:cursor-not-allowed disabled:opacity-50'
          >
            Cancel
          </button>
        </form>
      )}
    </ClassyDialog>
  );
}
